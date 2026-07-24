-- Ingenierías — esquema MariaDB
-- Puerto WAMP por defecto: 3307

CREATE DATABASE IF NOT EXISTS ingenierias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ingenierias;

-- Metadatos + topología vigente (borrador hasta Aprobada; Neo4j es post-aprobación)
CREATE TABLE IF NOT EXISTS ingenierias (
  id              VARCHAR(64)  NOT NULL,
  nombre          VARCHAR(255) NOT NULL,
  cliente         VARCHAR(255) NOT NULL DEFAULT '',
  cuenta          VARCHAR(64)  NOT NULL DEFAULT '',
  estado          VARCHAR(32)  NOT NULL DEFAULT 'Nueva',
  creada_por      VARCHAR(128) NOT NULL,
  creada_en       DATETIME(3)  NOT NULL,
  modificada_en   DATETIME(3)  NOT NULL,
  nodes_json      LONGTEXT     NOT NULL,
  edges_json      LONGTEXT     NOT NULL,
  editable        TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '0 = demo/solo lectura',
  activa          TINYINT(1)   NOT NULL DEFAULT 1,
  version_actual  INT UNSIGNED NOT NULL DEFAULT 1,
  neo4j_sync_at   DATETIME(3)  NULL COMMENT 'Cuando se empujó a Neo4j tras aprobar',
  PRIMARY KEY (id),
  KEY idx_ingenierias_estado (estado),
  KEY idx_ingenierias_creada_por (creada_por),
  KEY idx_ingenierias_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historial / versionado (siempre en MariaDB)
CREATE TABLE IF NOT EXISTS ingenieria_versiones (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ingenieria_id   VARCHAR(64)     NOT NULL,
  version         INT UNSIGNED    NOT NULL,
  estado          VARCHAR(32)     NOT NULL,
  nodes_json      LONGTEXT        NOT NULL,
  edges_json      LONGTEXT        NOT NULL,
  nota            VARCHAR(500)    NULL,
  creado_por      VARCHAR(128)    NOT NULL,
  creado_en       DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ingenieria_version (ingenieria_id, version),
  CONSTRAINT fk_version_ingenieria
    FOREIGN KEY (ingenieria_id) REFERENCES ingenierias (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'inge'@'localhost' IDENTIFIED BY 'inge_dev';
GRANT ALL PRIVILEGES ON ingenierias.* TO 'inge'@'localhost';
FLUSH PRIVILEGES;
