CREATE TABLE `buyUsers` (
  `userid` char(32) COLLATE latin1_german2_ci NOT NULL COMMENT 'unique identifier',
  `name` varchar(200) COLLATE latin1_german2_ci NOT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

CREATE TABLE `buyList` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userid` char(32) COLLATE latin1_german2_ci NOT NULL,
  `item` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `description` varchar(200) COLLATE latin1_german2_ci DEFAULT NULL,
  `added` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `bought` timestamp NULL DEFAULT NULL,
  `where` varchar(40) COLLATE latin1_german2_ci DEFAULT NULL,
  `priority` int(11) NOT NULL,  
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  CONSTRAINT `buyList_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `buyUsers` (`userid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

CREATE TABLE `buyMarkets` (
  `userid` char(32) COLLATE latin1_german2_ci NOT NULL,
  `name` varchar(40) COLLATE latin1_german2_ci NOT NULL,
  KEY `userid` (`userid`),
  UNIQUE KEY `name` (`userid`,`name`),
  CONSTRAINT `buyMarkets_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `buyUsers` (`userid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;
