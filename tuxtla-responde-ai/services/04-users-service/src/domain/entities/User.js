class User {
    constructor({ id, name, email, password, role, createdAt }) {
        this.id = id || require('crypto').randomUUID();
        this.name = name;
        this.email = email;
        this.password = password || null; // se hashea antes de persistir
        this.role = role || 'CIUDADANO';  // CIUDADANO, OPERADOR, ADMIN
        this.createdAt = createdAt || new Date();
    }

    // Representación pública (sin password)
    toSafeJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt,
        };
    }
}

module.exports = User;
