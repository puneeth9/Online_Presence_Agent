const express = require('express');

const {
  createJob,
  getJobStatus,
  getResult,
} = require('../controllers/analyze.controller');

const router = express.Router();

router.post('/', createJob);
router.get('/result/:id', getResult);
router.get('/:id', getJobStatus);

module.exports = router;
