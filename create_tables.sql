-- ======================================
-- 📄 CRCTS Database Schema
-- ======================================

DROP TABLE IF EXISTS case_criminals CASCADE;
DROP TABLE IF EXISTS case_records CASCADE;
DROP TABLE IF EXISTS firs CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS criminals CASCADE;
DROP TABLE IF EXISTS police_stations CASCADE;

-- ======================================
--  POLICE STATIONS
-- ======================================
CREATE TABLE police_stations (
    station_id SERIAL PRIMARY KEY,
    station_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    contact_number VARCHAR(20),
    jurisdiction_area TEXT
);

-- ======================================
--  CRIMINALS
-- ======================================
CREATE TABLE criminals (
    criminal_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20),
    address TEXT,
    aadhaar_number VARCHAR(20)
);

-- ======================================
--  COURTS
-- ======================================
CREATE TABLE courts (
    court_id SERIAL PRIMARY KEY,
    court_name VARCHAR(255) NOT NULL,
    court_type VARCHAR(100),
    city VARCHAR(100)
);

-- ======================================
--  FIRs
-- ======================================
CREATE TABLE firs (
    fir_id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES police_stations(station_id) ON DELETE CASCADE,
    date_registered DATE NOT NULL,
    crime_type VARCHAR(255),
    incident_location TEXT,
    status VARCHAR(255),
    details TEXT
);

-- ======================================
--  CASE RECORDS
-- ======================================
CREATE TABLE case_records (
    case_id SERIAL PRIMARY KEY,
    fir_id INTEGER REFERENCES firs(fir_id) ON DELETE CASCADE,
    court_id INTEGER REFERENCES courts(court_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    status VARCHAR(100),
    verdict TEXT
);

-- ======================================
--  CASE-CRIMINAL MAPPING
-- ======================================
CREATE TABLE case_criminals (
    case_criminal_id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES case_records(case_id) ON DELETE CASCADE,
    criminal_id INTEGER REFERENCES criminals(criminal_id) ON DELETE CASCADE,
    role_in_case VARCHAR(100)
);
