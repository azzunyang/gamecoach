-- Add is_admin flag to users
ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

-- Lectures (coach-created course offerings)
CREATE TABLE IF NOT EXISTS lectures (
  id           TEXT PRIMARY KEY,
  coach_id     TEXT NOT NULL REFERENCES coaches(id),
  title        TEXT NOT NULL,
  description  TEXT,
  game         TEXT NOT NULL,
  game_category TEXT NOT NULL,
  price_eth    TEXT NOT NULL,
  duration     INTEGER NOT NULL DEFAULT 60,
  level        TEXT NOT NULL DEFAULT '전체',
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Lecture wishlist
CREATE TABLE IF NOT EXISTS wishlist_lectures (
  user_id    TEXT NOT NULL REFERENCES users(id),
  lecture_id TEXT NOT NULL REFERENCES lectures(id),
  PRIMARY KEY (user_id, lecture_id)
);

CREATE INDEX IF NOT EXISTS idx_lectures_coach ON lectures(coach_id);
CREATE INDEX IF NOT EXISTS idx_lectures_game ON lectures(game_category);
