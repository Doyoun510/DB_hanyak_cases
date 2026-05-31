const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/caseController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// 누구나 조회 가능
router.get('/', getAll);
router.get('/:id', getOne);

// 한약사만 등록/수정/삭제
router.post('/', authMiddleware, requireRole('PHARMACIST'), create);
router.put('/:id', authMiddleware, requireRole('PHARMACIST'), update);
router.delete('/:id', authMiddleware, requireRole('PHARMACIST'), remove);

module.exports = router;
