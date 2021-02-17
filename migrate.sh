#! bin/bash

while getopts d:u:p: flag
do
	case "${flag}" in
		d) database=${OPTARG};;
		u) username=${OPTARG};;
        p) password=${OPTARG};;
	esac
done

if [[ -z $database || -z $username ]]; then
	echo -e "\e[31menter the database name (-d) and username (-u)"
else
    if [ ! -z $password ]; then
        export PGPASSWORD="$password"
    fi
    if [ $(psql -d $database -U $username -h localhost -t -c "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='migrations';") -eq 1 ]; then
        migrations_exists=true
    else
        migrations_exists=false
    fi
    new_migrations=()
    for filename in migrations/*.sql; do
        if [ $migrations_exists = false ] || ! [ $(psql -d $database -U $username -h localhost -t -c "SELECT 1 FROM Migrations WHERE file_name='$filename';") -eq 1 ]; then
            new_migrations="$new_migrations $filename"
            psql -d $database -U $username -h localhost -f "$filename"
        else
        fi
    done
    for migration in ${new_migrations[*]}; do
        psql -d $database -U $username -h localhost -t -c "INSERT INTO Migrations(file_name) VALUES('$migration');"
    done
fi