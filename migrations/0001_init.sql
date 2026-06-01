-- Users
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  phone       TEXT UNIQUE NOT NULL,
  discord_id  TEXT UNIQUE,
  role        TEXT NOT NULL CHECK(role IN ('coach','student','both')),
  wallet      TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Coach profiles
CREATE TABLE IF NOT EXISTS coaches (
  id            TEXT PRIMARY KEY REFERENCES users(id),
  nickname      TEXT NOT NULL,
  game_category TEXT NOT NULL,
  tier          TEXT NOT NULL,
  tier_self     INTEGER NOT NULL DEFAULT 1, -- 1 = self-reported
  price_eth     TEXT NOT NULL,              -- stored as string to avoid float issues
  session_min   INTEGER NOT NULL DEFAULT 60,
  intro         TEXT,
  curriculum    TEXT,                       -- JSON array
  style         TEXT,                       -- 진행 방식
  thumbnail     TEXT,                       -- R2 key
  is_published  INTEGER NOT NULL DEFAULT 0,
  avg_rating    REAL NOT NULL DEFAULT 0,
  review_count  INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Calendar slots
CREATE TABLE IF NOT EXISTS slots (
  id         TEXT PRIMARY KEY,
  coach_id   TEXT NOT NULL REFERENCES coaches(id),
  date       TEXT NOT NULL,  -- YYYY-MM-DD
  start_time TEXT NOT NULL,  -- HH:MM
  end_time   TEXT NOT NULL,
  is_booked  INTEGER NOT NULL DEFAULT 0
);

-- Lessons (matched sessions)
CREATE TABLE IF NOT EXISTS lessons (
  id              TEXT PRIMARY KEY,
  coach_id        TEXT NOT NULL REFERENCES coaches(id),
  student_id      TEXT NOT NULL REFERENCES users(id),
  slot_id         TEXT NOT NULL REFERENCES slots(id),
  contract_addr   TEXT NOT NULL,
  tx_hash         TEXT,
  state           TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK(state IN ('PENDING','ACCEPTED','ACTIVE','COMPLETED','REJECTED','CANCELLED','DISPUTED','RESOLVED')),
  deposit_eth     TEXT NOT NULL,
  balance_eth     TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  accepted_at     INTEGER,
  completed_at    INTEGER
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id            TEXT PRIMARY KEY,
  lesson_id     TEXT NOT NULL UNIQUE REFERENCES lessons(id),
  coach_id      TEXT NOT NULL REFERENCES coaches(id),
  student_id    TEXT NOT NULL REFERENCES users(id),
  score_explain INTEGER NOT NULL CHECK(score_explain BETWEEN 1 AND 5),
  score_comm    INTEGER NOT NULL CHECK(score_comm BETWEEN 1 AND 5),
  score_time    INTEGER NOT NULL CHECK(score_time BETWEEN 1 AND 5),
  score_curr    INTEGER NOT NULL CHECK(score_curr BETWEEN 1 AND 5),
  body          TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  lesson_id  TEXT NOT NULL REFERENCES lessons(id),
  sender_id  TEXT NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  type       TEXT NOT NULL,
  payload    TEXT,           -- JSON
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id           TEXT PRIMARY KEY,
  reporter_id  TEXT NOT NULL REFERENCES users(id),
  target_id    TEXT NOT NULL REFERENCES coaches(id),
  reason       TEXT NOT NULL,
  detail       TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  user_id   TEXT NOT NULL REFERENCES users(id),
  coach_id  TEXT NOT NULL REFERENCES coaches(id),
  PRIMARY KEY (user_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_slots_coach ON slots(coach_id, date);
CREATE INDEX IF NOT EXISTS idx_lessons_coach ON lessons(coach_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_lesson ON messages(lesson_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
