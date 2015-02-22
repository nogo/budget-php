CREATE TABLE IF NOT EXISTS `version` (
  `key` varchar(255),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) AUTO_INCREMENT ,
  `name` varchar(255) NOT NULL UNIQUE,
  `created_at` datetime DEFAULT NOW(),
  `updated_at` datetime DEFAULT NOW(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `budget` (
  `id` int(11) AUTO_INCREMENT ,
  `category_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'spend',
  `date` datetime DEFAULT NOW(),
  `amount` decimal(15,2) NOT NULL,
  `special` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT NOW(),
  `updated_at` datetime DEFAULT NOW(),
  PRIMARY KEY (`id`),
  CONSTRAINT FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;


INSERT INTO `version` VALUES ('20150221130000');