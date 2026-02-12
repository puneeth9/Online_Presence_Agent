const express = require('express');

const {
  createJob,
  getAllJobs,
  getJobStatus,
  getResult,
} = require('../controllers/analyze.controller');

const router = express.Router();

router.post('/', createJob);
router.get('/', getAllJobs);
router.get('/result/:id', getResult);
router.get('/:id', getJobStatus);

module.exports = router;
