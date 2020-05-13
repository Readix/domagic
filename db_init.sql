-- cleanup database
DROP TABLE IF EXISTS Requests;
DROP TABLE IF EXISTS Configs;
DROP TABLE IF EXISTS Plugins;
DROP TABLE IF EXISTS UserSessions;
DROP TABLE IF EXISTS Installations;
DROP TABLE IF EXISTS Feedbacks;
-- creating tables
-- table for storing all user`s feedback
CREATE TABLE Feedbacks (
    feedback_id SERIAL NOT NULL PRIMARY KEY,
    data        JSON NOT NULL,
    created     TIMESTAMP DEFAULT NOW()
);
-- table for storing plugin api keys
CREATE TABLE Plugins (
    client_id       INT NOT NULL PRIMARY KEY,
    client_secret   VARCHAR(32) NOT NULL
);
-- table for storing alghoritm configs
CREATE TABLE Configs (
    config_id   SERIAL NOT NULL PRIMARY KEY,
    data        JSON NOT NULL,
    created     TIMESTAMP DEFAULT (NOW())
);
-- table for storing user installations
CREATE TABLE Installations (
    install_id      SERIAL NOT NULL PRIMARY KEY,
    user_id         INT NOT NULL,
    team_id         INT NOT NULL,
    scope           VARCHAR(100) NOT NULL,
    access_token    CHAR(36) NOT NULL,
    token_type      VARCHAR(30) NOT NULL,
    registration    TIMESTAMP DEFAULT NOW(),
    deletion        TIMESTAMP NULL,
    feedback_id     INT NULL 
        REFERENCES Feedbacks(feedback_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
CREATE INDEX i_i_user_team ON Installations(user_id, team_id);
-- table for storing user session timestamps
CREATE TABLE UserSessions (
    session_id SERIAL NOT NULL PRIMARY KEY,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time   TIMESTAMP NULL,
    install_id INT NOT NULL 
        REFERENCES Installations(install_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE INDEX i_us_install ON UserSessions(install_id);
-- table for storing user generation requests
CREATE TABLE Requests (
    requiest_id SERIAL PRIMARY KEY,
    data        JSON NOT NULL,
    status      VARCHAR(100),
    timestamp   TIMESTAMP default (NOW()),
    install_id  INT NOT NULL
        REFERENCES Installations (install_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    config_id   INT NULL
        REFERENCES Configs (config_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    feedback_id INT NULL
        REFERENCES Feedbacks (feedback_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    session_id  INT NULL
        REFERENCES UserSessions (session_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE INDEX i_r_install ON Requests(install_id);
-- create functions
CREATE OR REPLACE FUNCTION start_session(userId INT, teamId INT) 
RETURNS INT AS $$
DECLARE 
    inst INT;
    sess INT;
BEGIN
    inst := (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    INSERT INTO UserSessions(install_id) VALUES(inst) RETURNING session_id INTO sess;
    RETURN sess;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION end_session(userId INT, teamId INT) 
RETURNS INT AS $$
DECLARE
    inst INT;
    sess INT;
BEGIN
    inst := (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    sess := (SELECT session_id FROM UserSessions WHERE install_id=inst AND end_time IS NULL ORDER BY start_time DESC LIMIT 1);
    UPDATE UserSessions SET end_time = NOW() WHERE session_id = sess;
    RETURN sess;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION insert_request(userId INT, teamId INT, req_data JSON, req_status VARCHAR(10)) 
RETURNS INT AS $$
DECLARE
    conf INT;
    inst INT;
    sess INT;
    requ INT;
BEGIN
    conf := (SELECT config_id FROM Configs ORDER BY created DESC LIMIT 1);
    inst := (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    sess := (SELECT session_id FROM UserSessions WHERE install_id=inst AND end_time IS NULL ORDER BY start_time DESC LIMIT 1);
    INSERT INTO Requests (install_id, config_id, session_id, data, status) VALUES(inst, conf, sess, req_data, req_status) RETURNING request_id INTO requ;
    RETURN requ;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION insert_config(config JSON)
RETURNS INT AS $$
DECLARE
    count_equal INT;
    conf INT;
BEGIN
    conf := -1;
    count_equal := (SELECT COUNT(*) FROM Configs WHERE config @> data AND config <@ data);
    IF count_equal = 0 THEN
        INSERT INTO Configs(data) VALUES(config) RETURNING config_id INTO conf;
    END IF;
    RETURN conf;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION insert_feedback_to_request(userId INT, teamId INT, feedback JSON)
RETURNS INT AS $$
DECLARE
    inst INT;
    requ INT;
    feed INT;
BEGIN
    inst = (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    requ = (SELECT requiest_id FROM Requests WHERE install_id=inst ORDER BY timestamp DESC LIMIT 1);
    INSERT INTO Feedbacks (data) VALUES(feedback) RETURNING feedback_id INTO feed;
    UPDATE Requests SET feedback_id = feed WHERE request_id = requ;
    RETURN feed;
END;
$$ LANGUAGE plpgsql;