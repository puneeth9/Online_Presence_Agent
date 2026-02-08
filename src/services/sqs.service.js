const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

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

async function sendJobToQueue(job) {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    throw new Error('SQS_QUEUE_URL is not configured');
  }
  console.log('Sending job to queue:', queueUrl);
  console.log('Job:', job);
  const messageBody = JSON.stringify({
    jobId: job.jobId,
    name: job.name
  });

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  });

  return sqsClient.send(command);
}

module.exports = {
  sendJobToQueue,
};
