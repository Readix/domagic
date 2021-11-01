#!/bin/bash
# 
# database update to version 2 (safety)
#
# ...............................
# README
# If postrgesql version < 13 
#	Do this in manual mode as superuser
# 	"CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;"
# Else postrgesql version > 13 and u have error with this
# 	grant create on database to your user
#	and try execute this script 
# ...............................

while getopts d:u: flag
do
	case "${flag}" in
		d) database=${OPTARG};;
		u) username=${OPTARG};;
	esac
done
if [[ -z $database || -z $username ]]; then
	echo -e "\e[31menter the database name (-d) and username (-u)"
else
	psql -d $database -U $username -h localhost -c \
	"
	-- create pgcrypto extension for uuid
	CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

	-- table for pay kays keeping
	CREATE TABLE Paykeys (
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
	CREATE INDEX i_paykey ON Paykeys(paykey_id);

	-- update plugins table
	ALTER TABLE plugins ADD COLUMN is_paid boolean default false NOT NULL;
	"
fi
