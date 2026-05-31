const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const findAll = async ({ keyword } = {}) => {
  return prisma.prescription.findMany({
    where: keyword ? { name: { contains: keyword } } : undefined,
    orderBy: { name: 'asc' },
  });
};

const findById = async (id) => {
  const p = await prisma.prescription.findUnique({ where: { id: Number(id) } });
  if (!p) throw new Error('Prescription not found');
  return p;
};

const create = async ({ name, category, ingredients, efficacy, description }) => {
  return prisma.prescription.create({
    data: { name, category, ingredients, efficacy, description },
  });
};

const update = async (id, { name, category, ingredients, efficacy, description }) => {
  return prisma.prescription.update({
    where: { id: Number(id) },
    data: { name, category, ingredients, efficacy, description },
  });
};

const remove = async (id) => {
  // 처방 삭제 + 관련 치험례 정리를 트랜잭션으로 처리
  return prisma.$transaction(async (tx) => {
    await tx.case.deleteMany({ where: { prescriptionId: Number(id) } });
    await tx.prescription.delete({ where: { id: Number(id) } });
  });
};

module.exports = { findAll, findById, create, update, remove };
