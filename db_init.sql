CREATE DATABASE IF NOT EXISTS `smart-layout`;
USE `smart-layout`;
-- cleanup database
DROP TABLE IF EXISTS `Requests`;
DROP TABLE IF EXISTS `Configs`;
DROP TABLE IF EXISTS `Plugins`;
DROP TABLE IF EXISTS `UserSessions`;
DROP TABLE IF EXISTS `Installations`;
DROP TABLE IF EXISTS `Feedbacks`;
-- creating tables
-- table for storing all user`s feedback
CREATE TABLE Feedbacks (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    data        JSON NOT NULL,
    created     DATETIME DEFAULT NOW()
) ENGINE=InnoDB;
-- table for storing plugin api keys
CREATE TABLE Plugins (
    client_id       INT NOT NULL PRIMARY KEY,
    client_secret   VARCHAR(32) NOT NULL
) ENGINE=InnoDB;
-- table for storing alghoritm configs
CREATE TABLE Configs (
    config_id   INT AUTO_INCREMENT PRIMARY KEY,
    data        JSON NOT NULL CHECK(JSON_VALID(data)),
    created     DATETIME DEFAULT (NOW())
) ENGINE=InnoDB;
-- table for storing user installations
CREATE TABLE Installations (
    install_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    team_id         INT NOT NULL,
    scope           VARCHAR(100) NOT NULL,
    access_token    CHAR(36) NOT NULL,
    token_type      VARCHAR(30) NOT NULL,
    registration    DATETIME DEFAULT NOW(),
    deletion        DATETIME NULL,
    feedback_id     INT NULL,
    INDEX(user_id, team_id),
    CONSTRAINT `fk_installation_feedback` FOREIGN KEY 
        (feedback_id) REFERENCES Feedbacks (feedback_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;
-- table for storing user session timestamps
CREATE TABLE UserSessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    install_id INT NOT NULL,
    start_time DATETIME DEFAULT NOW(),
    end_time   DATETIME NULL,
    INDEX(install_id),
    CONSTRAINT `fk_session_install` FOREIGN KEY 
        (install_id) REFERENCES Installations (install_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
-- table for storing user generation requests
CREATE TABLE Requests (
    requiest_id INT AUTO_INCREMENT PRIMARY KEY,
    install_id  INT NOT NULL,
    config_id   INT NULL,
    feedback_id INT NULL,
    session_id  INT NULL,
    data        JSON NOT NULL CHECK(JSON_VALID(data)),
    status      VARCHAR(100),
    timestamp   DATETIME default (NOW()),
    INDEX(install_id),
    CONSTRAINT `fk_request_account` FOREIGN KEY 
        (install_id) REFERENCES Installations (install_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_request_config` FOREIGN KEY 
        (config_id) REFERENCES Configs (config_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_request_feedback` FOREIGN KEY 
        (feedback_id) REFERENCES Feedbacks (feedback_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT `fk_request_session` FOREIGN KEY 
        (session_id) REFERENCES UserSessions (session_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- create functions
DELIMITER $$
CREATE FUNCTION start_session(userId INT, teamId INT) 
RETURNS INT
BEGIN
    SET @inst = (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    SET @sess = (INSERT INTO UserSessions SET install_id = @inst RETURNING session_id);
    RETURN @sess;
END$$
DELIMITER ;
DELIMITER $$
CREATE FUNCTION end_session(userId INT, teamId INT) 
RETURNS INT
BEGIN
    SET @inst = (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    SET @sess = (SELECT session_id FROM UserSessions WHERE install_id=@inst AND end_time IS NULL ORDER BY start_time DESC LIMIT 1);
    UPDATE UserSessions SET end_time = NOW() WHERE session_id = @sess;
    RETURN @sess;
END$$
DELIMITER ;
DELIMITER $$
CREATE FUNCTION insert_request(userId INT, teamId INT, req_data JSON, req_status VARCHAR(10)) 
RETURNS INT
BEGIN
    SET @conf = (SELECT config_id FROM Configs ORDER BY created DESC LIMIT 1);
    SET @inst = (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    SET @sess = (SELECT session_id FROM UserSessions WHERE install_id=@inst AND end_time IS NULL ORDER BY start_time DESC LIMIT 1);
    RETURN (INSERT INTO Requests (install_id, config_id, session_id, data, status) VALUES(@inst, @conf, @sess, req_data, req_status) RETURNING request_id);
END$$
DELIMITER ;
DELIMITER $$
CREATE FUNCTION insert_feedback_to_request(userId INT, teamId INT, feedback JSON)
RETURNS INT
BEGIN
    SET @inst = (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    SET @requ = (SELECT requiest_id FROM Requests WHERE install_id=@inst ORDER BY timestamp DESC LIMIT 1);
    SET @feed = (INSERT INTO Feedbacks (data) VALUES(feedback) RETURNING feedback_id);
    UPDATE Requests SET feedback_id = @feed WHERE request_id = @requ;
    RETURN @feed;
END$$
DELIMITER ;