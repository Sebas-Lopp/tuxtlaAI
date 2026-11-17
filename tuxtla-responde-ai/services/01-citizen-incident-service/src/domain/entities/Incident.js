class Incident {
  constructor({ id, type, title, description, latitude, longitude, photoUrl, status, priority, severity, citizenId, citizenName, moderation, createdAt }) {
    // Validaciones de negocio obligatorias
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      throw new Error("Las coordenadas GPS son obligatorias.");
    }

    this.id = id || require('crypto').randomUUID();
    this.type = type || 'BACHE';
    this.title = title || '';
    this.description = description || '';
    this.latitude = latitude;
    this.longitude = longitude;
    this.photoUrl = photoUrl || null;
    this.status = status || 'PENDIENTE';
    this.priority = priority || 'MEDIA';
    this.severity = severity || 'MEDIA';
    this.citizenId = citizenId || null;
    this.citizenName = citizenName || null;
    this.moderation = moderation || 'PENDIENTE'; // PENDIENTE | APROBADO | RECHAZADO
    this.createdAt = createdAt || new Date();
  }

  clasificarConIA(nivelPrioridad) {
    this.priority = nivelPrioridad;
    this.status = 'CLASIFICADO';
  }

  marcarEnProgreso() {
    this.status = 'EN_PROCESO';
  }

  marcarResuelto() {
    this.status = 'RESUELTO';
  }
}

module.exports = Incident;
