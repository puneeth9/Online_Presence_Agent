const express = require('express');
const cors = require('cors');

const analyzeRoutes = require('./routes/analyze.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/analyze', analyzeRoutes);

module.exports = app;
