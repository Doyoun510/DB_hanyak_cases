const express = require('express');
const router = express.Router();
const service = require('../services/prescriptionService');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
  try {
    res.json(await service.findAll({ keyword: req.query.keyword }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.json(await service.findById(req.params.id));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// 한약사만 처방 등록 가능
router.post('/', authMiddleware, requireRole('PHARMACIST'), async (req, res) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, requireRole('PHARMACIST'), async (req, res) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, requireRole('PHARMACIST'), async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
