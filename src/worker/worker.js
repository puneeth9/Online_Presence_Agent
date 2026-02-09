require('dotenv').config();

const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require('@aws-sdk/client-sqs');

const { connectDB, closeDB } = require('../db');
const { runMigrations } = require('../db/migrate');
const { processJob } = require('./processJob');

function createSqsClient() {
  const region = process.env.AWS_REGION || 'us-east-1';

  // Use env credentials if provided, otherwise rely on the default AWS credential chain.
  const hasEnvCreds =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  return new SQSClient({
    region,
    credentials: hasEnvCreds
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  });
}

const sqsClient = createSqsClient();

async function receiveMessages(queueUrl) {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    WaitTimeSeconds: 10,
    MaxNumberOfMessages: 1,
  });

  const response = await sqsClient.send(command);
  return response.Messages || [];
}

async function deleteMessage(queueUrl, receiptHandle) {
  const command = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(command);
}

let shouldRun = true;
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Worker shutting down (${signal})`);
  shouldRun = false;

  try {
    await closeDB();
  } catch (err) {
    console.error('Failed to close DB pool', err);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

async function main() {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    console.error('SQS_QUEUE_URL is not configured');
    process.exit(1);
  }

  await connectDB();
  await runMigrations();

  console.log('Worker started');

  while (shouldRun) {
    let messages = [];
    try {
      messages = await receiveMessages(queueUrl);
    } catch (err) {
      console.error('Failed to receive messages from SQS', err);
      continue;
    }

    for (const message of messages) {
      try {
        const body = message.Body ? JSON.parse(message.Body) : null;
        await processJob(body);

        if (message.ReceiptHandle) {
          await deleteMessage(queueUrl, message.ReceiptHandle);
        }
      } catch (err) {
        console.error('Failed to process message', err);

        // For deterministic/config failures (e.g. missing BRAVE_API_KEY) we delete
        // the message after marking the job failed in DB (handled inside processJob).
        // This avoids an endless poison-message retry loop.
        if (message.ReceiptHandle) {
          try {
            await deleteMessage(queueUrl, message.ReceiptHandle);
          } catch (deleteErr) {
            console.error('Failed to delete message from SQS', deleteErr);
          }
        }
      }
    }
  }
}

main().catch((err) => {
  console.error('Worker failed to start', err);
  process.exit(1);
});

