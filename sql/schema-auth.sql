-- Usuarios y sesiones (auth local; LDAP/OAuth se enchufan después)
USE ingenierias;

CREATE TABLE IF NOT EXISTS usuarios (
  id              VARCHAR(64)  NOT NULL,
  nombre          VARCHAR(128) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NULL COMMENT 'Solo auth local; NULL si LDAP/OAuth',
  perfil          VARCHAR(32)  NOT NULL DEFAULT 'Consulta',
  activo          TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  modificado_en   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_sesiones (
  token           VARCHAR(128) NOT NULL,
  usuario_id      VARCHAR(64)  NOT NULL,
  provider        VARCHAR(32)  NOT NULL DEFAULT 'local',
  creada_en       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expira_en       DATETIME(3)  NOT NULL,
  revocada        TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (token),
  KEY idx_sesion_usuario (usuario_id),
  KEY idx_sesion_expira (expira_en),
  CONSTRAINT fk_sesion_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
