-- Proyección híbrida de la topología (fase 2)
-- Fuente de verdad del canvas: ingenierias.nodes_json / edges_json
-- Estas tablas se regeneran al crear / guardar / cambiar estado.
-- No migran datos de la BD anterior. Sin anillos (futuro).

USE ingenierias;

-- ── Dispositivos (nodos del canvas) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingenieria_dispositivos (
  ingenieria_id     VARCHAR(64)  NOT NULL,
  id                VARCHAR(64)  NOT NULL COMMENT 'id del nodo React Flow',
  tipo              VARCHAR(64)  NOT NULL DEFAULT '',
  label             VARCHAR(255) NOT NULL DEFAULT '',
  origen            VARCHAR(64)  NOT NULL DEFAULT 'Manual',
  registrado_cmdb   TINYINT(1)   NOT NULL DEFAULT 0,
  hostname          VARCHAR(128) NULL,
  modelo            VARCHAR(128) NULL,
  ip                VARCHAR(64)  NULL,
  serial            VARCHAR(128) NULL,
  ubicacion         VARCHAR(255) NULL,
  fabricante        VARCHAR(128) NULL,
  pos_x             DOUBLE       NULL,
  pos_y             DOUBLE       NULL,
  custom_fields_json LONGTEXT    NULL,
  proyectado_en     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (ingenieria_id, id),
  KEY idx_disp_tipo (tipo),
  KEY idx_disp_hostname (hostname),
  KEY idx_disp_ip (ip),
  CONSTRAINT fk_disp_ingenieria
    FOREIGN KEY (ingenieria_id) REFERENCES ingenierias (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Interfaces (explícitas en nodo o derivadas de enlaces / troncal) ─────────
CREATE TABLE IF NOT EXISTS ingenieria_interfaces (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ingenieria_id     VARCHAR(64)  NOT NULL,
  dispositivo_id    VARCHAR(64)  NOT NULL,
  nombre            VARCHAR(128) NOT NULL,
  rol               VARCHAR(32)  NULL COMMENT 'salida|llegada|miembro|gestion|…',
  etiqueta          VARCHAR(128) NULL,
  ip_segmento       VARCHAR(64)  NULL,
  mascara           VARCHAR(64)  NULL,
  gateway           VARCHAR(64)  NULL,
  vlan              VARCHAR(64)  NULL,
  descripcion       VARCHAR(400) NULL,
  origen_dato       VARCHAR(32)  NOT NULL DEFAULT 'derivada'
    COMMENT 'explicita|derivada',
  enlace_id         VARCHAR(64)  NOT NULL DEFAULT ''
    COMMENT 'vacío si explícita en el nodo; id del edge si derivada',
  custom_fields_json LONGTEXT    NULL,
  proyectado_en     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_iface (ingenieria_id, dispositivo_id, nombre, enlace_id),
  KEY idx_iface_disp (ingenieria_id, dispositivo_id),
  CONSTRAINT fk_iface_ingenieria
    FOREIGN KEY (ingenieria_id) REFERENCES ingenierias (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Enlaces (edges del canvas) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingenieria_enlaces (
  ingenieria_id     VARCHAR(64)  NOT NULL,
  id                VARCHAR(64)  NOT NULL COMMENT 'id del edge React Flow',
  source_id         VARCHAR(64)  NOT NULL,
  target_id         VARCHAR(64)  NOT NULL,
  tipo              VARCHAR(64)  NOT NULL DEFAULT 'UTP',
  origen            VARCHAR(64)  NOT NULL DEFAULT 'Manual',
  registrado_cmdb   TINYINT(1)   NOT NULL DEFAULT 0,
  clase             VARCHAR(16)  NOT NULL DEFAULT 'simple' COMMENT 'simple|troncal',
  troncal_codigo    VARCHAR(128) NULL,
  uuid_enlace       VARCHAR(128) NULL,
  numero_enlace     VARCHAR(128) NULL,
  puerto_salida     VARCHAR(128) NULL,
  etiqueta_salida   VARCHAR(128) NULL,
  puerto_llegada    VARCHAR(128) NULL,
  etiqueta_llegada  VARCHAR(128) NULL,
  servicios         VARCHAR(255) NULL,
  custom_fields_json LONGTEXT    NULL,
  proyectado_en     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (ingenieria_id, id),
  KEY idx_enl_source (ingenieria_id, source_id),
  KEY idx_enl_target (ingenieria_id, target_id),
  KEY idx_enl_clase (clase),
  CONSTRAINT fk_enl_ingenieria
    FOREIGN KEY (ingenieria_id) REFERENCES ingenierias (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Miembros de troncal ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingenieria_enlace_miembros (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ingenieria_id     VARCHAR(64)  NOT NULL,
  enlace_id         VARCHAR(64)  NOT NULL,
  dispositivo_id    VARCHAR(64)  NOT NULL,
  interfaz          VARCHAR(128) NOT NULL,
  etiqueta          VARCHAR(128) NULL,
  rol               VARCHAR(32)  NULL COMMENT 'A|B|miembro|…',
  orden             INT UNSIGNED NOT NULL DEFAULT 0,
  proyectado_en     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_miembro (ingenieria_id, enlace_id, dispositivo_id, interfaz),
  KEY idx_miembro_enlace (ingenieria_id, enlace_id),
  CONSTRAINT fk_miembro_ingenieria
    FOREIGN KEY (ingenieria_id) REFERENCES ingenierias (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
