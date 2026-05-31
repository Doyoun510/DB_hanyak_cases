const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const caseRoutes = require('./cases');
const prescriptionRoutes = require('./prescriptions');

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/prescriptions', prescriptionRoutes);

module.exports = router;
