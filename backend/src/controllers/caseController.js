const caseService = require('../services/caseService');

const getAll = async (req, res) => {
  try {
    const cases = await caseService.findAll(req.query);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const c = await caseService.findById(req.params.id);
    res.json(c);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const c = await caseService.create({
      ...req.body,
      authorId: req.userId,
    });
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const c = await caseService.update(req.params.id, req.body, req.userId);
    res.json(c);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await caseService.remove(req.params.id, req.userId);
    res.status(204).end();
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
