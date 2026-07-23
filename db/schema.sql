CREATE TABLE IF NOT EXISTS subjects (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id            SERIAL PRIMARY KEY,
  subject_id    INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  score         NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  label         TEXT,
  recorded_at   DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grades_subject_recorded
  ON grades (subject_id, recorded_at);
