USE `smart-layout`;
-- creating tables
DROP TABLE IF EXISTS Installations;
CREATE TABLE Installations (
    install_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    team_id         INT NOT NULL,
    scope           VARCHAR(100) NOT NULL,
    access_token    CHAR(36) NOT NULL,
    token_type      VARCHAR(30) NOT NULL,
    registration    DATETIME DEFAULT (NOW())
) ENGINE=InnoDB;
DROP TABLE IF EXISTS Configs;
CREATE TABLE Configs (
    config_id   INT AUTO_INCREMENT PRIMARY KEY,
    data        JSON NOT NULL CHECK(JSON_VALID(data)),
    created     DATETIME DEFAULT (NOW()),
) ENGINE=InnoDB;
DROP TABLE IF EXISTS Requests;
CREATE TABLE Requests (
    requiest_id INT AUTO_INCREMENT PRIMARY KEY,
    install_id  INT NOT NULL,
    config_id   INT NOT NULL,
    data        JSON NOT NULL CHECK(JSON_VALID(data)),
    status      VARCHAR(10),
    timestamp   DATETIME default (NOW()),
    CONSTRAINT `fk_request_account` FOREIGN KEY 
        (install_id) REFERENCES Installations (install_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_request_config` FOREIGN KEY 
        (config_id) REFERENCES Configs (config_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- create procedures
DROP PROCEDURE IF EXISTS insert_request;
DELIMITER $$
CREATE PROCEDURE insert_request(userId INT, teamId INT, req_data JSON, req_status VARCHAR(10))
BEGIN
    SET @conf = (SELECT config_id FROM Configs ORDER BY created DESC LIMIT 1);
    SET @inst = (SELECT install_id FROM Installations WHERE user_id=userId AND team_id=teamId);
    INSERT INTO Requests (install_id, config_id, data, status) VALUES(@inst, @conf, req_data, req_status);
END$$
DELIMITER ;
-- link for more information about partition procedures - https://mariadb.com/resources/blog/automatic-partition-maintenance-in-mariadb/
-- DROP PROCEDURE IF EXISTS create_new_partitions;
-- DELIMITER $$
-- CREATE PROCEDURE create_new_partitions(p_schema varchar(64), p_table varchar(64), p_months_to_add int)
--    LANGUAGE SQL
--    NOT DETERMINISTIC
--    SQL SECURITY INVOKER
-- BEGIN  
--    DECLARE done INT DEFAULT FALSE;
--    DECLARE current_partition_name varchar(64);
--    DECLARE current_partition_ts int;
   
--    DECLARE cur1 CURSOR FOR 
--    SELECT partition_name 
--    FROM information_schema.partitions 
--    WHERE TABLE_SCHEMA = p_schema 
--    AND TABLE_NAME = p_table 
--    AND PARTITION_NAME != 'p_first'
--    AND PARTITION_NAME != 'p_future'
--    AND PARTITION_NAME = @partition_name_to_add;
   
--    DECLARE cur2 CURSOR FOR 
--    SELECT partition_name, partition_range_ts 
--    FROM partitions_to_add;
   
--    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
   
--    DROP TEMPORARY TABLE IF EXISTS partitions_to_add;
   
--    CREATE TEMPORARY TABLE partitions_to_add (
--       partition_name varchar(64),
--       partition_range_ts int
--    );
   
--    SET @partitions_added = FALSE;
--    SET @months_ahead = 0;
   
--    WHILE @months_ahead <= p_months_to_add DO
--       SET @date = CURDATE();
--       SET @q = 'SELECT DATE_ADD(?, INTERVAL ? MONTH) INTO @month_to_add';
--       PREPARE st FROM @q;
--       EXECUTE st USING @date, @months_ahead;
--       DEALLOCATE PREPARE st;
--       SET @months_ahead = @months_ahead + 1;
      
--       SET @q = 'SELECT DATE_FORMAT(@month_to_add, ''%Y%m'') INTO @formatted_month_to_add';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
      
--       SET @q = 'SELECT CONCAT(''p'', @formatted_month_to_add) INTO @partition_name_to_add';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
     
--       SET done = FALSE; 
--       SET @first = TRUE;
     
--       OPEN cur1;

--       read_loop: LOOP
--          FETCH cur1 INTO current_partition_name;
      
--          IF done AND @first THEN
--             SELECT CONCAT('Creating partition: ', @partition_name_to_add);

--             SET @q = 'SELECT DATE_FORMAT(@month_to_add, ''%Y-%m-01 00:00:00'') INTO @month_to_add';
--             PREPARE st FROM @q;
--             EXECUTE st;
--             DEALLOCATE PREPARE st; 

--             SET @q = 'SELECT DATE_ADD(?, INTERVAL 1 MONTH) INTO @partition_end_date';
--             PREPARE st FROM @q;
--             EXECUTE st USING @month_to_add;
--             DEALLOCATE PREPARE st;

--             SELECT UNIX_TIMESTAMP(@partition_end_date) INTO @partition_end_ts;
         
--             INSERT INTO partitions_to_add VALUES (@partition_name_to_add, @partition_end_ts);
--             SET @partitions_added = TRUE;
--          END IF;
        
--          IF ! @first THEN
--             LEAVE read_loop;
--          END IF;
        
--          SET @first = FALSE;
--       END LOOP;
     
--      CLOSE cur1;
--    END WHILE;
   
--    IF @partitions_added THEN
--       SET @schema = p_schema;
--       SET @table = p_table;
--       SET @q = 'SELECT CONCAT(''ALTER TABLE '', @schema, ''.'', @table, '' REORGANIZE PARTITION p_future INTO ( '') INTO @query';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
     
--       SET done = FALSE;
--       SET @first = TRUE;
     
--       OPEN cur2;

--       read_loop: LOOP
--          FETCH cur2 INTO current_partition_name, current_partition_ts;
       
--         IF done THEN
--             LEAVE read_loop;
--          END IF;
      
--          IF ! @first THEN
--             SET @q = 'SELECT CONCAT(@query, '', '') INTO @query';
--             PREPARE st FROM @q;
--             EXECUTE st;
--             DEALLOCATE PREPARE st;
--          END IF;

--          SET @partition_name =  current_partition_name;
--          SET @partition_ts =  current_partition_ts;         
--          SET @q = 'SELECT CONCAT(@query, ''PARTITION '', @partition_name, '' VALUES LESS THAN ('', @partition_ts, '')'') INTO @query';
--          PREPARE st FROM @q;
--          EXECUTE st;
--          DEALLOCATE PREPARE st;
       
--          SET @first = FALSE;
--       END LOOP;
     
--       CLOSE cur2;
     
--       SET @q = 'SELECT CONCAT(@query, '', PARTITION p_future VALUES LESS THAN (MAXVALUE))'') INTO @query';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
     
--       PREPARE st FROM @query;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;  
--    END IF;
   
--    DROP TEMPORARY TABLE partitions_to_add;
-- END$$
-- DELIMITER ;

-- DROP PROCEDURE IF EXISTS drop_old_partitions;
-- DELIMITER $$
-- CREATE PROCEDURE drop_old_partitions(p_schema varchar(64), p_table varchar(64), p_months_to_keep int, p_seconds_to_sleep int)
--    LANGUAGE SQL
--    NOT DETERMINISTIC
--    SQL SECURITY INVOKER
-- BEGIN  
--    DECLARE done INT DEFAULT FALSE;
--    DECLARE current_partition_name varchar(64);
   
--    DECLARE cur1 CURSOR FOR 
--    SELECT partition_name 
--    FROM information_schema.partitions 
--    WHERE TABLE_SCHEMA = p_schema 
--    AND TABLE_NAME = p_table 
--    AND PARTITION_NAME != 'p_first'
--    AND PARTITION_NAME != 'p_future'
--    AND PARTITION_NAME < @last_partition_name_to_keep;
   
--    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
   
--    SET @date = CURDATE();
--    SET @months_to_keep = p_months_to_keep;   
--    SET @q = 'SELECT DATE_SUB(?, INTERVAL ? MONTH) INTO @last_month_to_keep';
--    PREPARE st FROM @q;
--    EXECUTE st USING @date, @months_to_keep;
--    DEALLOCATE PREPARE st;
   
--    SET @q = 'SELECT DATE_FORMAT(@last_month_to_keep, ''%Y%m'') INTO @formatted_last_month_to_keep';
--    PREPARE st FROM @q;
--    EXECUTE st;
--    DEALLOCATE PREPARE st;
   
--    SET @q = 'SELECT CONCAT(''p'', @formatted_last_month_to_keep) INTO @last_partition_name_to_keep';
--    PREPARE st FROM @q;
--    EXECUTE st;
--    DEALLOCATE PREPARE st;
   
--    SELECT CONCAT('Dropping all partitions before: ', @last_partition_name_to_keep);
   
--    SET @first = TRUE;
   
--    OPEN cur1;

--    read_loop: LOOP
--       FETCH cur1 INTO current_partition_name;
   
--       IF done THEN
--          LEAVE read_loop;
--       END IF;
     
--       IF ! @first AND p_seconds_to_sleep > 0 THEN
--          SELECT CONCAT('Sleeping for ', p_seconds_to_sleep, ' seconds');
--          SELECT SLEEP(p_seconds_to_sleep);
--       END IF;

--       SELECT CONCAT('Dropping partition: ', current_partition_name);
   
--       SET @schema = p_schema;
--       SET @table = p_table;
--       SET @partition = current_partition_name;
--       SET @q = 'SELECT CONCAT(''ALTER TABLE '', @schema, ''.'', @table, '' DROP PARTITION '', @partition) INTO @query';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
      
--       PREPARE st FROM @query;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
     
--       SET @first = FALSE;
--    END LOOP;
   
--    CLOSE cur1;
   
--    IF ! @first THEN
--       SET @q = 'SELECT DATE_FORMAT(@last_month_to_keep, ''%Y-%m-01 00:00:00'') INTO @new_first_partition_date';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;     
--       SELECT UNIX_TIMESTAMP(@new_first_partition_date) INTO @new_first_partition_ts;
     
--       SET @q = 'SELECT DATE_ADD(@new_first_partition_date, INTERVAL 1 MONTH) INTO @second_partition_date';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
--       SELECT UNIX_TIMESTAMP(@second_partition_date) INTO @second_partition_ts;
  
--       SELECT CONCAT('Reorganizing first and second partitions. first partition date = ', @new_first_partition_date, ', second partition date = ', @second_partition_date);
   
--       SET @schema = p_schema;
--       SET @table = p_table;
--       SET @q = 'SELECT CONCAT(''ALTER TABLE '', @schema, ''.'', @table, '' REORGANIZE PARTITION p_first, '', @last_partition_name_to_keep, '' INTO ( PARTITION p_first VALUES LESS THAN ( '', @new_first_partition_ts, '' ), PARTITION '', @last_partition_name_to_keep, '' VALUES LESS THAN ( '', @second_partition_ts, '' ) ) '') INTO @query';
--       PREPARE st FROM @q;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
     
--       PREPARE st FROM @query;
--       EXECUTE st;
--       DEALLOCATE PREPARE st;
--    END IF;
-- END$$
-- DELIMITER ;

-- DROP PROCEDURE IF EXISTS perform_partition_maintenance;
-- DELIMITER $$
-- CREATE PROCEDURE perform_partition_maintenance(p_schema varchar(64), p_table varchar(64), p_months_to_add int, p_months_to_keep int, p_seconds_to_sleep int)
--    LANGUAGE SQL
--    NOT DETERMINISTIC
--    SQL SECURITY INVOKER
-- BEGIN 
--    CALL db1.drop_old_partitions(p_schema, p_table, p_months_to_keep, p_seconds_to_sleep);
--    CALL db1.create_new_partitions(p_schema, p_table, p_months_to_add);
-- END$$
-- DELIMITER ;

-- SET GLOBAL event_scheduler=ON;
-- DROP EVENT monthly_perform_partition_maintenance_event;
-- CREATE EVENT monthly_perform_partition_maintenance_event
--    ON SCHEDULE
--    EVERY 1 MONTH
--    STARTS NOW()
-- DO
--    CALL db1.perform_partition_maintenance('smart-layout', 'Requests', 3, 6, 5);