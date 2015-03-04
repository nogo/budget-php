SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;
START TRANSACTION;

CREATE TABLE IF NOT EXISTS `version` (
  `key` varchar(255),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `with_description` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO categories (`name`) VALUES ('Bäcker');
INSERT INTO categories (`name`) VALUES ('Mittag');
INSERT INTO categories (`name`, with_description) VALUES ('Einkauf', 1);
INSERT INTO categories (`name`, with_description) VALUES ('Unterhaltung', 1);
INSERT INTO categories (`name`, with_description) VALUES ('Transport', 1);
INSERT INTO categories (`name`, with_description) VALUES ('Kinder', 1);
INSERT INTO categories (`name`, with_description) VALUES ('sonstiges', 1);

CREATE TABLE IF NOT EXISTS `budget` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11),
  `type` varchar(255) NOT NULL DEFAULT 'spend',
  `date` datetime NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `special` tinyint(1) NOT NULL DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_category_id` FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `version` VALUES ('20150221130000');

SET FOREIGN_KEY_CHECKS=1;
COMMIT;