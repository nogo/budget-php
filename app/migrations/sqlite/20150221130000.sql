PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS version (
  `key` VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  with_description INTEGER NOT NULL DEFAULT 0
);

INSERT INTO categories (`name`) VALUES ('Bäcker');
INSERT INTO categories (`name`) VALUES ('Mittag');
INSERT INTO categories (`name`, with_description) VALUES ('Einkauf', 1);
INSERT INTO categories (`name`, with_description) VALUES ('Unterhaltung', 1);
INSERT INTO categories (`name`, with_description) VALUES ('Transport', 1);
INSERT INTO categories (`name`, with_description) VALUES ('Kinder', 1);
INSERT INTO categories (`name`, with_description) VALUES ('sonstiges', 1);

CREATE TABLE IF NOT EXISTS budget (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'spend',
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(15,2) NOT NULL,
  `special` INTEGER NOT NULL DEFAULT 0,
  description VARCHAR(255)
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

INSERT INTO `version` VALUES ('20150221130000');