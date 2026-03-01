-- DANGEROUS: Drops all tables to reset schema
DROP TABLE IF EXISTS assessment_results CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Apply the correct schema
\i 'D:/AI/AI Full Stack/Simplish FS/database/schema.sql'
