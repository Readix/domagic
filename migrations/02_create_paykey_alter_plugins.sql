-- create pgcrypto extension for uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- table for pay kays keeping
CREATE TABLE IF NOT EXISTS Paykeys (
    paykey_id       BIGSERIAL NOT NULL PRIMARY KEY,
    client_id       BIGINT NOT NULL
        REFERENCES Plugins(client_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    paykey          UUID DEFAULT gen_random_uuid() NOT NULL,
    install_id      BIGINT NULL
        REFERENCES Installations(install_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    info           VARCHAR(100) NULL
);
CREATE INDEX IF NOT EXISTS i_paykey ON Paykeys(paykey_id);

-- update plugins table
ALTER TABLE plugins ADD COLUMN IF NOT EXISTS is_paid boolean default false NOT NULL;