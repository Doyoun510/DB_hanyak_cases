const pool = require('../db');

// SELECT 시 사용하는 공통 컬럼 + JOIN으로 author/prescription을 nested 객체로 만듦
const SELECT_CASE_BASE = `
  SELECT
    c.id,
    c.title,
    c.patient_age     AS "patientAge",
    c.patient_gender  AS "patientGender",
    c.patient_weight  AS "patientWeight",
    c.chief_complaint AS "chiefComplaint",
    c.diagnosis,
    c.treatment,
    c.progress,
    c.content,
    c.created_at      AS "createdAt",
    c.updated_at      AS "updatedAt",
    json_build_object('id', u.id, 'name', u.name) AS author,
    json_build_object('id', p.id, 'name', p.name, 'category', p.category) AS prescription
  FROM cases c
  INNER JOIN users         u ON c.author_id       = u.id
  INNER JOIN prescriptions p ON c.prescription_id = p.id
`;

/**
 * 치험례 목록 — JOIN (users, prescriptions) + 동적 WHERE + ORDER BY
 */
const findAll = async ({ prescriptionId, authorId } = {}) => {
  const conds = [];
  const params = [];

  if (prescriptionId) {
    params.push(Number(prescriptionId));
    conds.push(`c.prescription_id = $${params.length}`);
  }
  if (authorId) {
    params.push(Number(authorId));
    conds.push(`c.author_id = $${params.length}`);
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const sql = `${SELECT_CASE_BASE} ${where} ORDER BY c.created_at DESC`;

  const result = await pool.query(sql, params);
  return result.rows;
};

/**
 * 치험례 단건 조회 (JOIN 포함)
 */
const findById = async (id) => {
  const sql = `${SELECT_CASE_BASE} WHERE c.id = $1`;
  const result = await pool.query(sql, [Number(id)]);
  if (result.rows.length === 0) throw new Error('Case not found');
  return result.rows[0];
};

/**
 * 치험례 등록 — INSERT
 */
const create = async ({
  title, patientAge, patientGender, patientWeight,
  chiefComplaint, diagnosis, treatment, progress, content,
  prescriptionId, authorId,
}) => {
  const insertResult = await pool.query(
    `INSERT INTO cases
       (title, patient_age, patient_gender, patient_weight,
        chief_complaint, diagnosis, treatment, progress, content,
        prescription_id, author_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      title,
      patientAge !== '' && patientAge != null ? Number(patientAge) : null,
      patientGender || null,
      patientWeight !== '' && patientWeight != null ? Number(patientWeight) : null,
      chiefComplaint || null,
      diagnosis || null,
      treatment || null,
      progress || null,
      content || '',
      Number(prescriptionId),
      Number(authorId),
    ]
  );

  // INSERT 후 JOIN된 형태로 다시 조회 (프론트가 기대하는 구조 맞춤)
  return findById(insertResult.rows[0].id);
};

/**
 * 치험례 수정 — 트랜잭션으로 (소유자 확인 + UPDATE)
 */
const update = async (id, body, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. 소유자 검증
    const owner = await client.query(
      'SELECT author_id FROM cases WHERE id = $1',
      [Number(id)]
    );
    if (owner.rows.length === 0) throw new Error('Case not found');
    if (owner.rows[0].author_id !== userId) {
      throw new Error('수정 권한이 없습니다.');
    }

    // 2. UPDATE
    await client.query(
      `UPDATE cases SET
         title           = COALESCE($1, title),
         patient_age     = $2,
         patient_gender  = COALESCE($3, patient_gender),
         patient_weight  = $4,
         chief_complaint = COALESCE($5, chief_complaint),
         diagnosis       = COALESCE($6, diagnosis),
         treatment       = COALESCE($7, treatment),
         progress        = COALESCE($8, progress),
         content         = COALESCE($9, content),
         updated_at      = NOW()
       WHERE id = $10`,
      [
        body.title ?? null,
        body.patientAge !== '' && body.patientAge != null ? Number(body.patientAge) : null,
        body.patientGender ?? null,
        body.patientWeight !== '' && body.patientWeight != null ? Number(body.patientWeight) : null,
        body.chiefComplaint ?? null,
        body.diagnosis ?? null,
        body.treatment ?? null,
        body.progress ?? null,
        body.content ?? null,
        Number(id),
      ]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return findById(id);
};

/**
 * 치험례 삭제 — 트랜잭션으로 (소유자 확인 + DELETE)
 */
const remove = async (id, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const owner = await client.query(
      'SELECT author_id FROM cases WHERE id = $1',
      [Number(id)]
    );
    if (owner.rows.length === 0) throw new Error('Case not found');
    if (owner.rows[0].author_id !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await client.query('DELETE FROM cases WHERE id = $1', [Number(id)]);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { findAll, findById, create, update, remove };
