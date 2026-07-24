-- Configuración administrable del aplicativo (MariaDB)
USE ingenierias;

-- Tipos de dispositivo (sidebar, canvas, iconos/colores)
CREATE TABLE IF NOT EXISTS cfg_dispositivo_tipo (
  codigo            VARCHAR(64)  NOT NULL,
  label             VARCHAR(128) NOT NULL,
  icon_key          VARCHAR(64)  NOT NULL COMMENT 'Clave SVG built-in o id de icono',
  icon_url          VARCHAR(512) NULL COMMENT 'Ruta/URL de imagen custom (opcional)',
  orden             INT UNSIGNED NOT NULL DEFAULT 0,
  columna           TINYINT UNSIGNED NOT NULL DEFAULT 1,
  color_fill_light  VARCHAR(16)  NOT NULL DEFAULT '#EFF6FF',
  color_stroke_light VARCHAR(16) NOT NULL DEFAULT '#2563EB',
  color_fill_dark   VARCHAR(16)  NOT NULL DEFAULT '#1E3A5F',
  color_stroke_dark VARCHAR(16)  NOT NULL DEFAULT '#2563EB',
  color_minimap     VARCHAR(16)  NOT NULL DEFAULT '#2563EB',
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (codigo),
  KEY idx_cfg_disp_orden (orden),
  KEY idx_cfg_disp_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de enlace
CREATE TABLE IF NOT EXISTS cfg_enlace_tipo (
  codigo            VARCHAR(64)  NOT NULL,
  label             VARCHAR(128) NOT NULL,
  stroke            VARCHAR(16)  NOT NULL DEFAULT '#2563EB',
  stroke_width      DECIMAL(4,2) NOT NULL DEFAULT 2.00,
  stroke_dasharray  VARCHAR(32)  NULL,
  orden             INT UNSIGNED NOT NULL DEFAULT 0,
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (codigo),
  KEY idx_cfg_enl_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orígenes (Discovery / Excel / Manual …)
CREATE TABLE IF NOT EXISTS cfg_origen (
  codigo            VARCHAR(64)  NOT NULL,
  label             VARCHAR(128) NOT NULL,
  color             VARCHAR(16)  NOT NULL DEFAULT '#9098B0',
  orden             INT UNSIGNED NOT NULL DEFAULT 0,
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (codigo),
  KEY idx_cfg_origen_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campos del panel derecho (dispositivo | enlace)
CREATE TABLE IF NOT EXISTS cfg_campo_panel (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  entidad           ENUM('dispositivo','enlace') NOT NULL,
  campo_key         VARCHAR(64)  NOT NULL COMMENT 'clave en data/metadatos',
  label             VARCHAR(128) NOT NULL,
  grupo             VARCHAR(64)  NOT NULL DEFAULT 'metadatos' COMMENT 'raiz|metadatos',
  tipo_input        VARCHAR(32)  NOT NULL DEFAULT 'text' COMMENT 'text|select|readonly',
  orden             INT UNSIGNED NOT NULL DEFAULT 0,
  visible           TINYINT(1)   NOT NULL DEFAULT 1,
  editable          TINYINT(1)   NOT NULL DEFAULT 1,
  requerido         TINYINT(1)   NOT NULL DEFAULT 0,
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cfg_campo (entidad, campo_key),
  KEY idx_cfg_campo_orden (entidad, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
