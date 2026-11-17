// src/2-application/use-cases/CreateIncidentUseCase.js
const Incident = require('../../domain/entities/Incident');

class CreateIncidentUseCase {
  // Recibimos el repositorio desde afuera (Inyección de dependencias)
  // No nos importa si es el real de PostGIS o uno falso para pruebas
  constructor(incidentRepository) {
    this.incidentRepository = incidentRepository; 
  }

  async execute(incidentData) {
    // 1. Crear la entidad. Si falta el GPS o la foto, fallará aquí mismo.
    const newIncident = new Incident(incidentData);

    // 2. Guardar el reporte usando el contrato del repositorio
    await this.incidentRepository.save(newIncident);

    // 3. Retornar el reporte creado
    return newIncident;
  }
}

module.exports = CreateIncidentUseCase;