DROP DATABASE IF EXISTS `smart-layout`;
CREATE DATABASE `smart-layout`;
USE `smart-layout`;
-- creating tables
DROP TABLE IF EXISTS Installations;
CREATE TABLE Installations (
    user_id         INT NOT NULL,
    team_id         INT NOT NULL,
    scope           VARCHAR(100) NOT NULL,
    access_token    CHAR(36) NOT NULL,
    token_type      VARCHAR(30) NOT NULL,
    registration    DATETIME DEFAULT NOW(),
    deletion        DATETIME NULL,
    feedback_id     INT NULL,
    PRIMARY KEY(user_id, team_id)
    CONSTRAINT `fk_installation_feedback` FOREIGN KEY 
        (feedback_id) REFERENCES Feedback (feedback_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;
-- table for feedback
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    data        JSON NOT NULL,
    created     DATETIME DEFAULT NOW()
) ENGINE=InnoDB;
DROP TABLE IF EXISTS Plugins;
CREATE TABLE Plugins (
    client_id       INT NOT NULL PRIMARY KEY,
    client_secret   VARCHAR(32) NOT NULL,
) ENGINE=InnoDB;