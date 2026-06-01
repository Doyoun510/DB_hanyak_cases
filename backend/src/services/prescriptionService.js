const pool = require('../db');

/**
 * 처방 목록 — WHERE/LIKE 키워드 검색 + ORDER BY 정렬
 */
const findAll = async ({ keyword } = {}) => {
  if (keyword) {
    // WHERE name LIKE '%keyword%'  +  ORDER BY name ASC
    const result = await pool.query(
      `SELECT id, name, category, ingredients, efficacy, description
       FROM prescriptions
       WHERE name LIKE $1
       ORDER BY name ASC`,
      [`%${keyword}%`]
    );
    return result.rows;
  }

  const result = await pool.query(
    `SELECT id, name, category, ingredients, efficacy, description
     FROM prescriptions
     ORDER BY name ASC`
  );
  return result.rows;
};

/**
 * ID로 단일 처방 조회
 */
const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, category, ingredients, efficacy, description,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
     FROM prescriptions
     WHERE id = $1`,
    [Number(id)]
  );
  if (result.rows.length === 0) throw new Error('Prescription not found');
  return result.rows[0];
};

/**
 * 처방 등록 — INSERT ... RETURNING
 */
const create = async ({ name, category, ingredients, efficacy, description }) => {
  const result = await pool.query(
    `INSERT INTO prescriptions (name, category, ingredients, efficacy, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, category, ingredients, efficacy, description`,
    [name, category, ingredients || null, efficacy || null, description || null]
  );
  return result.rows[0];
};

/**
 * 처방 수정 — UPDATE ... RETURNING
 */
const update = async (id, { name, category, ingredients, efficacy, description }) => {
  const result = await pool.query(
    `UPDATE prescriptions
     SET name        = $1,
         category    = $2,
         ingredients = $3,
         efficacy    = $4,
         description = $5,
         updated_at  = NOW()
     WHERE id = $6
     RETURNING id, name, category, ingredients, efficacy, description`,
    [name, category, ingredients || null, efficacy || null, description || null, Number(id)]
  );
  if (result.rows.length === 0) throw new Error('Prescription not found');
  return result.rows[0];
};

/**
 * 처방 삭제 — 트랜잭션으로 관련 치험례 일괄 삭제 후 처방 삭제
 * (FK 제약을 우회하면서 데이터 일관성 보장)
 */
const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. 이 처방을 참조하는 치험례 먼저 삭제
    await client.query('DELETE FROM cases WHERE prescription_id = $1', [Number(id)]);

    // 2. 처방 삭제
    const result = await client.query(
      'DELETE FROM prescriptions WHERE id = $1 RETURNING id',
      [Number(id)]
    );
    if (result.rows.length === 0) throw new Error('Prescription not found');

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { findAll, findById, create, update, remove };
