-- =====================================================================
-- TuxtlaResponde AI — Migración v2 (auth + moderación + comentarios)
-- Ejecutar: mysql -u adminSebas -pmegadethxd < migrate-v2.sql
-- =====================================================================

-- 1) Usuarios: columna de contraseña (hash bcrypt)
USE tuxtla_users;
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;

-- 2) Cuenta de administrador por defecto
--    email: admin@tuxtla.mx  ·  password: admin123
INSERT INTO users (id, name, email, role, password_hash, created_at)
SELECT 'admin-001', 'Administrador', 'admin@tuxtla.mx', 'ADMIN',
       '$2a$10$5CPrLljwzrcLhn1FsLDQA.h0M1hC59eAXBmspd9FLjNAhaE6IywNy', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@tuxtla.mx');

-- 3) Incidencias: autor y estado de moderación
USE tuxtla_responde;
ALTER TABLE incidents ADD COLUMN citizen_name VARCHAR(120) NULL;
ALTER TABLE incidents ADD COLUMN moderation VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';

-- Los datos de demostración ya están aprobados
UPDATE incidents SET moderation = 'APROBADO' WHERE id LIKE 'seed-%';

-- 4) Tabla de comentarios
CREATE TABLE IF NOT EXISTS comments (
    id          VARCHAR(64)  NOT NULL,
    incident_id VARCHAR(64)  NOT NULL,
    user_id     VARCHAR(64)  NULL,
    user_name   VARCHAR(120) NOT NULL,
    content     TEXT         NOT NULL,
    created_at  DATETIME     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_comments_incident (incident_id)
) ENGINE=InnoDB;
