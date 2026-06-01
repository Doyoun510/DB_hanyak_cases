const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

/**
 * 회원가입 — 트랜잭션으로 중복 확인 + 유저 생성을 원자적으로 처리
 * SQL: BEGIN → SELECT → INSERT → COMMIT  (실패 시 ROLLBACK)
 */
const register = async ({ email, password, name, role }) => {
  const hashed = await bcrypt.hash(password, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 중복 이메일 검사
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      throw new Error('Email already in use');
    }

    // 새 사용자 삽입
    const result = await client.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role,
                 created_at AS "createdAt"`,
      [email, hashed, name, role || 'USER']
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/**
 * 로그인 — SELECT로 사용자 조회 + bcrypt 비교 + JWT 발급
 */
const login = async ({ email, password }) => {
  const result = await pool.query(
    `SELECT id, email, password, name, role
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

/**
 * ID로 사용자 조회
 */
const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, email, name, role,
            created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
};

module.exports = { register, login, findById };
