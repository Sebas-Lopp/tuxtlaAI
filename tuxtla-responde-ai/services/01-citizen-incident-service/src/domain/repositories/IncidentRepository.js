class IncidentRepository {
  async save(incident) {
    throw new Error("El método save() debe ser implementado por la capa de infraestructura.");
  }

  async findById(id) {
    throw new Error("El método findById() debe ser implementado.");
  }

  async findNearby(latitude, longitude, radiusInMeters) {
    throw new Error("El método findNearby() debe ser implementado.");
  }
}

module.exports = IncidentRepository;