-- =====================================================================
-- TuxtlaResponde AI — Inicialización de bases de datos (MySQL 8)
-- Se crean 7 bases lógicas (una por microservicio), fiel a la arquitectura.
-- Ejecutar con:  mysql -u adminSebas -p < init-mysql.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS tuxtla_responde      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tuxtla_dispatch      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tuxtla_transparency  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tuxtla_users         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tuxtla_notifications CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tuxtla_media         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tuxtla_ai_triage     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Microservicio 01 — Citizen Incidents (coordenadas espaciales reales)
-- ---------------------------------------------------------------------
USE tuxtla_responde;
CREATE TABLE IF NOT EXISTS incidents (
    id          VARCHAR(64)  NOT NULL,
    type        VARCHAR(50)  NOT NULL DEFAULT 'BACHE',
    title       VARCHAR(255) NULL,
    description TEXT         NULL,
    status      VARCHAR(40)  NOT NULL DEFAULT 'PENDIENTE',
    priority    VARCHAR(40)  NOT NULL DEFAULT 'MEDIA',
    severity    VARCHAR(40)  NOT NULL DEFAULT 'MEDIA',
    photo_url   VARCHAR(500) NULL,
    citizen_id  VARCHAR(100) NULL,
    geom        POINT        NOT NULL SRID 4326,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Microservicio 02 — Dispatch
-- ---------------------------------------------------------------------
USE tuxtla_dispatch;
CREATE TABLE IF NOT EXISTS dispatches (
    id          VARCHAR(64)  NOT NULL,
    incident_id VARCHAR(64)  NOT NULL,
    crew_name   VARCHAR(120) NOT NULL,
    status      VARCHAR(40)  NOT NULL DEFAULT 'ASIGNADA',
    assigned_at DATETIME     NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Microservicio 03 — Transparency (bitácora de indicadores)
-- ---------------------------------------------------------------------
USE tuxtla_transparency;
CREATE TABLE IF NOT EXISTS transparency_logs (
    id             VARCHAR(64)   NOT NULL,
    indicator_name VARCHAR(120)  NOT NULL,
    value          DECIMAL(12,2) NOT NULL,
    category       VARCHAR(60)   NOT NULL DEFAULT 'GENERAL',
    status         VARCHAR(40)   NULL,
    recorded_at    DATETIME      NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Microservicio 04 — Users
-- ---------------------------------------------------------------------
USE tuxtla_users;
CREATE TABLE IF NOT EXISTS users (
    id         VARCHAR(64)  NOT NULL,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(160) NOT NULL,
    role       VARCHAR(40)  NOT NULL DEFAULT 'CIUDADANO',
    created_at DATETIME     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Microservicio 05 — Notifications
-- ---------------------------------------------------------------------
USE tuxtla_notifications;
CREATE TABLE IF NOT EXISTS notifications (
    id           VARCHAR(64)  NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(40)  NOT NULL DEFAULT 'PUSH',
    sent_at      DATETIME     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Microservicio 06 — Media Evidence (almacenamiento local físico)
-- ---------------------------------------------------------------------
USE tuxtla_media;
CREATE TABLE IF NOT EXISTS media_evidence (
    id          VARCHAR(64)  NOT NULL,
    incident_id VARCHAR(64)  NOT NULL,
    file_url    VARCHAR(500) NOT NULL,
    file_type   VARCHAR(80)  NOT NULL DEFAULT 'image/jpeg',
    uploaded_at DATETIME     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Microservicio 07 — AI Vision (triage de severidad)
-- ---------------------------------------------------------------------
USE tuxtla_ai_triage;
CREATE TABLE IF NOT EXISTS ai_analyses (
    id          VARCHAR(64)   NOT NULL,
    incident_id VARCHAR(64)   NOT NULL,
    image_url   VARCHAR(500)  NOT NULL,
    severity    VARCHAR(40)   NOT NULL,
    confidence  DECIMAL(5,4)  NOT NULL DEFAULT 0.0000,
    analyzed_at DATETIME      NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
