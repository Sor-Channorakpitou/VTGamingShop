-- Runs once, when the postgres volume is first created.
-- The catalog database comes from POSTGRES_DB; Keycloak gets its own.
CREATE DATABASE keycloak;
