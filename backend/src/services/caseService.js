const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const findAll = async ({ prescriptionId, authorId }) => {
  const where = {};
  if (prescriptionId) where.prescriptionId = Number(prescriptionId);
  if (authorId) where.authorId = Number(authorId);

  return prisma.case.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: {
      author: { select: { id: true, name: true } },
      prescription: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id) => {
  const c = await prisma.case.findUnique({
    where: { id: Number(id) },
    include: {
      author: { select: { id: true, name: true } },
      prescription: { select: { id: true, name: true, category: true } },
    },
  });
  if (!c) throw new Error('Case not found');
  return c;
};

const CASE_FIELDS = [
  'title',
  'patientAge',
  'patientGender',
  'patientWeight',
  'chiefComplaint',
  'diagnosis',
  'treatment',
  'progress',
  'content',
];

const pickCaseData = (body) => {
  const data = {};
  for (const f of CASE_FIELDS) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  // 숫자 필드 변환
  if (data.patientAge !== undefined && data.patientAge !== null && data.patientAge !== '') {
    data.patientAge = Number(data.patientAge);
  } else if (data.patientAge === '') {
    data.patientAge = null;
  }
  if (data.patientWeight !== undefined && data.patientWeight !== null && data.patientWeight !== '') {
    data.patientWeight = Number(data.patientWeight);
  } else if (data.patientWeight === '') {
    data.patientWeight = null;
  }
  return data;
};

const create = async ({ prescriptionId, authorId, ...rest }) => {
  return prisma.case.create({
    data: {
      ...pickCaseData(rest),
      content: rest.content || '', // NOT NULL 보장
      prescriptionId: Number(prescriptionId),
      authorId: Number(authorId),
    },
  });
};

const update = async (id, body, userId) => {
  const c = await prisma.case.findUnique({ where: { id: Number(id) } });
  if (!c) throw new Error('Case not found');
  if (c.authorId !== userId) throw new Error('수정 권한이 없습니다.');

  return prisma.case.update({
    where: { id: Number(id) },
    data: pickCaseData(body),
  });
};

const remove = async (id, userId) => {
  // 권한 확인 + 삭제를 트랜잭션으로 묶어 일관성 보장
  return prisma.$transaction(async (tx) => {
    const c = await tx.case.findUnique({ where: { id: Number(id) } });
    if (!c) throw new Error('Case not found');
    if (c.authorId !== userId) throw new Error('삭제 권한이 없습니다.');

    return tx.case.delete({ where: { id: Number(id) } });
  });
};

module.exports = { findAll, findById, create, update, remove };
