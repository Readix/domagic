CREATE TABLE IF NOT EXISTS Tariff(
    tariff_id BIGSERIAL NOT NULL PRIMARY KEY,
    plugin_id BIGINT NOT NULL
        REFERENCES Plugins(client_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    cost REAL NOT NULL DEFAULT 0,
    info JSON NOT NULL
);

ALTER TABLE Paykeys ADD COLUMN IF NOT EXISTS created TIMESTAMP default (NOW()) NOT NULL;
ALTER TABLE Paykeys ADD COLUMN IF NOT EXISTS used TIMESTAMP NULL;
ALTER TABLE Paykeys DROP COLUMN IF EXISTS client_id;
ALTER TABLE Paykeys ADD COLUMN IF NOT EXISTS tariff_id BIGINT NOT NULL REFERENCES Tariff(tariff_id) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS Wordman_dices(
    wordman_dice_id BIGSERIAL NOT NULL PRIMARY KEY,
    install_id BIGINT NOT NULL
        REFERENCES Installations(install_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    name VARCHAR(50) NOT NULL,
    data JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS Migrations(
    migration_id BIGSERIAL NOT NULL PRIMARY KEY,
    file_name VARCHAR(200),
    created TIMESTAMP default (NOW()) NOT NULL
);

CREATE OR REPLACE FUNCTION buy(token CHAR(36))
RETURNS INT AS $$
DECLARE
    inst BIGINT;
    sess BIGINT;
BEGIN
    inst := (SELECT install_id FROM Installations WHERE access_token = token);
    IF inst IS NULL THEN
        RAISE EXCEPTION  'For access_token % installation_id is %', access_token, inst;
    END IF;
    sess := (SELECT session_id FROM UserSessions WHERE install_id=inst AND end_time IS NULL ORDER BY start_time DESC LIMIT 1);
    IF sess IS NULL THEN
        RAISE EXCEPTION  'For installation_id is % session is %', inst, sess;
    END IF;
    UPDATE UserSessions SET end_time = NOW() WHERE session_id = sess;
    RETURN sess;
END;
$$ LANGUAGE plpgsql;

-- todo alter start_session end_session, add column token in usersessions