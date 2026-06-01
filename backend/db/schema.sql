-- ====================================================
-- 한약 치험례 아카이브 - 데이터베이스 스키마 (DDL)
-- ====================================================
-- 3개 테이블: users, prescriptions, cases
-- 관계: users 1:N cases, prescriptions 1:N cases

-- 사용자 역할 타입
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'PHARMACIST');
  END IF;
END$$;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'USER',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 처방 테이블
CREATE TABLE IF NOT EXISTS prescriptions (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  category     TEXT NOT NULL,
  ingredients  TEXT,
  efficacy     TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 치험례 테이블 (외래키 2개)
CREATE TABLE IF NOT EXISTS cases (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  patient_age      INTEGER,
  patient_gender   TEXT,
  patient_weight   DOUBLE PRECISION,
  chief_complaint  TEXT,
  diagnosis        TEXT,
  treatment        TEXT,
  progress         TEXT,
  content          TEXT NOT NULL DEFAULT '',
  prescription_id  INTEGER NOT NULL REFERENCES prescriptions(id),
  author_id        INTEGER NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 조회 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_cases_prescription_id ON cases(prescription_id);
CREATE INDEX IF NOT EXISTS idx_cases_author_id       ON cases(author_id);
