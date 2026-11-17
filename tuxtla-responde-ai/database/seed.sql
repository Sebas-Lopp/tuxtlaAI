-- =====================================================================
-- TuxtlaResponde AI — Datos de demostración (opcional)
-- Ejecutar: mysql -u adminSebas -pmegadethxd < seed.sql
-- Nota MySQL: para SRID 4326 el orden del WKT es POINT(latitud longitud).
-- =====================================================================

USE tuxtla_responde;
INSERT INTO incidents (id, type, title, description, status, priority, severity, photo_url, citizen_id, geom, created_at) VALUES
('seed-001', 'BACHE',      'Bache profundo en Blvd. Belisario Domínguez', 'Bache de gran tamaño que daña las llantas de los vehículos.', 'PENDIENTE',  'ALTA',  'ALTA',  NULL, 'ciudadano-01', ST_GeomFromText('POINT(16.7516 -93.1167)', 4326), NOW() - INTERVAL 2 DAY),
('seed-002', 'LUMINARIA',  'Luminaria fundida en Av. Central',           'Lámpara apagada que deja la calle a oscuras por la noche.',  'RESUELTO',   'BAJA',  'BAJA',  NULL, 'ciudadano-02', ST_GeomFromText('POINT(16.7543 -93.1201)', 4326), NOW() - INTERVAL 6 DAY),
('seed-003', 'BASURA',     'Acumulación de basura en mercado',           'Basura acumulada desde hace varios días cerca del mercado.',  'EN_PROCESO', 'MEDIA', 'MEDIA', NULL, 'ciudadano-03', ST_GeomFromText('POINT(16.7481 -93.1099)', 4326), NOW() - INTERVAL 3 DAY),
('seed-004', 'FUGA_AGUA',  'Fuga de agua en calle 5 de Mayo',            'Fuga de agua potable que inunda la banqueta.',               'PENDIENTE',  'ALTA',  'ALTA',  NULL, 'ciudadano-04', ST_GeomFromText('POINT(16.7467 -93.1135)', 4326), NOW() - INTERVAL 1 DAY),
('seed-005', 'BACHE',      'Bache moderado en la colonia Centro',        'Bache mediano que requiere atención.',                        'RESUELTO',   'MEDIA', 'MEDIA', NULL, 'ciudadano-05', ST_GeomFromText('POINT(16.7572 -93.1224)', 4326), NOW() - INTERVAL 10 DAY),
('seed-006', 'LUMINARIA',  'Luminaria parpadeando en parque',            'Foco intermitente que molesta a los vecinos.',               'PENDIENTE',  'BAJA',  'BAJA',  NULL, 'ciudadano-06', ST_GeomFromText('POINT(16.7521 -93.1055)', 4326), NOW() - INTERVAL 12 HOUR),
('seed-007', 'BACHE',      'Bache pequeño en entrada de fraccionamiento','Bache superficial pero molesto para motociclistas.',         'EN_PROCESO', 'BAJA',  'BAJA',  NULL, 'ciudadano-07', ST_GeomFromText('POINT(16.7412 -93.1290)', 4326), NOW() - INTERVAL 4 DAY),
('seed-008', 'BASURA',     'Basura en parque público',                   'Contenedores desbordados en área recreativa.',               'PENDIENTE',  'MEDIA', 'MEDIA', NULL, 'ciudadano-08', ST_GeomFromText('POINT(16.7605 -93.1180)', 4326), NOW() - INTERVAL 5 HOUR);

USE tuxtla_users;
INSERT INTO users (id, name, email, role, created_at) VALUES
('u-001', 'Sebastián Gómez', 'sebas@tuxtla.mx', 'ADMIN',      NOW()),
('u-002', 'María López',     'maria@tuxtla.mx', 'CIUDADANO',  NOW()),
('u-003', 'Cuadrilla Norte', 'norte@tuxtla.mx', 'OPERADOR',   NOW());

USE tuxtla_dispatch;
INSERT INTO dispatches (id, incident_id, crew_name, status, assigned_at) VALUES
('d-001', 'seed-003', 'Cuadrilla Norte - Limpieza', 'EN_CAMINO', NOW() - INTERVAL 1 DAY),
('d-002', 'seed-007', 'Cuadrilla Sur - Bacheo',     'ASIGNADA',  NOW() - INTERVAL 3 HOUR);

USE tuxtla_notifications;
INSERT INTO notifications (id, recipient_id, message, type, sent_at) VALUES
('n-001', 'ciudadano-01', 'Tu reporte fue recibido y está en revisión.', 'PUSH', NOW() - INTERVAL 2 DAY),
('n-002', 'ciudadano-03', 'La cuadrilla ya atiende tu reporte de basura.', 'PUSH', NOW() - INTERVAL 1 DAY);
