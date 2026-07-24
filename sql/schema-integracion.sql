-- Publicación post-aprobación (consumo por sistemas externos → Neo4j u otros)
USE ingenierias;

ALTER TABLE ingenierias
  ADD COLUMN IF NOT EXISTS publicacion_estado VARCHAR(32) NULL
    COMMENT 'pendiente|publicada|error|NULL si no aplica',
  ADD COLUMN IF NOT EXISTS publicacion_en DATETIME(3) NULL
    COMMENT 'Último intento o ACK de publicación',
  ADD COLUMN IF NOT EXISTS publicacion_error VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS publicacion_intentos INT UNSIGNED NOT NULL DEFAULT 0;

-- Índice para colas de consumo
CREATE INDEX IF NOT EXISTS idx_ingenierias_publicacion
  ON ingenierias (estado, publicacion_estado, activa);
