-- password_hash is NULL until Aisha/Suhaib log in for the first time, at which
-- point whatever password they submit becomes their permanent hash (seeded by
-- scripts/migrate.mjs, not here, since it needs to compute the scrypt hash).
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id                SERIAL PRIMARY KEY,
  subject_id        INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  points_earned     NUMERIC(8,2) NOT NULL CHECK (points_earned >= 0),
  points_possible   NUMERIC(8,2) NOT NULL CHECK (points_possible > 0),
  label             TEXT,
  recorded_at       DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One-time transition for the original `score` (0-100) column: treat every
-- existing entry as "score out of 100" so its percentage is unchanged, then
-- drop it. No-ops once `score` is gone, so this stays safe to re-run.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'score'
  ) THEN
    ALTER TABLE grades ADD COLUMN IF NOT EXISTS points_earned NUMERIC(8,2);
    ALTER TABLE grades ADD COLUMN IF NOT EXISTS points_possible NUMERIC(8,2);

    UPDATE grades SET points_earned = score, points_possible = 100
    WHERE points_earned IS NULL;

    ALTER TABLE grades ALTER COLUMN points_earned SET NOT NULL;
    ALTER TABLE grades ALTER COLUMN points_possible SET NOT NULL;
    ALTER TABLE grades ADD CONSTRAINT grades_points_earned_check CHECK (points_earned >= 0);
    ALTER TABLE grades ADD CONSTRAINT grades_points_possible_check CHECK (points_possible > 0);

    ALTER TABLE grades DROP COLUMN score;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_grades_subject_recorded
  ON grades (subject_id, recorded_at);

-- grade_id/subject_id are plain references (no FK) so a row survives its
-- grade or subject being deleted; subject_name is snapshotted for the same reason.
CREATE TABLE IF NOT EXISTS grade_audit_log (
  id            SERIAL PRIMARY KEY,
  action        TEXT NOT NULL CHECK (action IN ('add', 'edit', 'delete')),
  grade_id      INTEGER,
  subject_id    INTEGER,
  subject_name  TEXT NOT NULL,
  before_data   JSONB,
  after_data    JSONB,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE grade_audit_log ADD COLUMN IF NOT EXISTS actor TEXT;

CREATE INDEX IF NOT EXISTS idx_grade_audit_log_occurred_at
  ON grade_audit_log (occurred_at DESC);

-- Fixed checklist, seeded once below. `name` is unique so re-running this
-- file (ON CONFLICT DO NOTHING) never duplicates the seed data.
CREATE TABLE IF NOT EXISTS quran_items (
  id            SERIAL PRIMARY KEY,
  category      TEXT NOT NULL,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  sort_order    INTEGER NOT NULL,
  completed     BOOLEAN NOT NULL DEFAULT false,
  completed_at  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO quran_items (category, name, description, sort_order) VALUES
  ('Salah', 'Surah Al-Fatiha', NULL, 1),
  ('Salah', 'Surah during sitting', NULL, 2),
  ('Salah', 'Dua at the end', NULL, 3),
  ('Qaida', 'Lessons 1-5', 'The basic Arabic alphabet, combined (compound) letters, abbreviated letters, and letter recognition.', 1),
  ('Qaida', 'Lessons 6-9', 'Short vowels (Harakat: Fatha, Kasra, Dhamma) and long vowels (Madd: Alif, Waw, Ya).', 2),
  ('Qaida', 'Lessons 10-13', 'Tanween (double vowels), Sukoon (halting/silent letters), and Shaddah (doubled letters).', 3),
  ('Qaida', 'Lessons 14-17', 'Practical Tajweed rules, including the rules of Noon Saakin and Meem Saakin, as well as specific Quranic pauses and verses.', 4),
  ('Surahs', '100. Al-''Adiyat (The Chargers)', NULL, 100),
  ('Surahs', '101. Al-Qari''ah (The Calamity)', NULL, 101),
  ('Surahs', '102. At-Takathur (The Accumulation)', NULL, 102),
  ('Surahs', '103. Al-''Asr (The Time)', NULL, 103),
  ('Surahs', '104. Al-Humazah (The Slanderer)', NULL, 104),
  ('Surahs', '105. Al-Fil (The Elephant)', NULL, 105),
  ('Surahs', '106. Quraysh (The Quraysh)', NULL, 106),
  ('Surahs', '107. Al-Ma''un (The Small Kindnesses)', NULL, 107),
  ('Surahs', '108. Al-Kawthar (The Abundance)', NULL, 108),
  ('Surahs', '109. Al-Kafirun (The Disbelievers)', NULL, 109),
  ('Surahs', '110. An-Nasr (The Help)', NULL, 110),
  ('Surahs', '111. Al-Masad (The Palm Fiber)', NULL, 111),
  ('Surahs', '112. Al-Ikhlas (The Sincerity)', NULL, 112),
  ('Surahs', '113. Al-Falaq (The Daybreak)', NULL, 113),
  ('Surahs', '114. An-Nas (Mankind)', NULL, 114)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS quran_audit_log (
  id            SERIAL PRIMARY KEY,
  action        TEXT NOT NULL CHECK (action IN ('complete', 'uncomplete')),
  item_id       INTEGER,
  item_name     TEXT NOT NULL,
  category      TEXT NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quran_audit_log ADD COLUMN IF NOT EXISTS actor TEXT;

CREATE INDEX IF NOT EXISTS idx_quran_audit_log_occurred_at
  ON quran_audit_log (occurred_at DESC);
