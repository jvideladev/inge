-- Comentarios / conversación por ingeniería (rechazo, envío a revisión, etc.)
USE ingenierias;

CREATE TABLE IF NOT EXISTS ingenieria_comentarios (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ingenieria_id   VARCHAR(64)     NOT NULL,
  usuario         VARCHAR(128)    NOT NULL,
  perfil          VARCHAR(32)     NULL,
  texto           TEXT            NOT NULL,
  estado_destino  VARCHAR(32)     NULL COMMENT 'Estado al que se asoció el comentario (si aplica)',
  creado_en       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_coment_ing (ingenieria_id, creado_en),
  CONSTRAINT fk_coment_ingenieria
    FOREIGN KEY (ingenieria_id) REFERENCES ingenierias (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Renombrar estado legacy Nueva → En construcción
UPDATE ingenierias SET estado = 'En construcción' WHERE estado = 'Nueva';
UPDATE ingenieria_versiones SET estado = 'En construcción' WHERE estado = 'Nueva';
