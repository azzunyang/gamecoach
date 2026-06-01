PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS users_v2 (
  id          TEXT PRIMARY KEY,
  phone       TEXT UNIQUE,
  discord_id  TEXT UNIQUE,
  role        TEXT NOT NULL CHECK(role IN ('coach','student','both')),
  wallet      TEXT UNIQUE,
  nickname    TEXT NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO users_v2 (id, phone, discord_id, role, wallet, nickname, created_at)
SELECT id, phone, discord_id, role, wallet, nickname, created_at FROM users;

DROP TABLE users;
ALTER TABLE users_v2 RENAME TO users;

PRAGMA foreign_keys = ON;
