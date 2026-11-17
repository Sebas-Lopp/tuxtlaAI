const bcrypt = require('bcryptjs');
const User = require('../../domain/entities/User');

class RegisterUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userData) {
        const { name, email, password, role } = userData;

        if (!name || !email || !password) {
            throw new Error('name, email y password son obligatorios.');
        }
        if (String(password).length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new Error('Ya existe un usuario con ese correo.');
        }

        // El registro público siempre crea ciudadanos; solo un admin puede crear otros roles.
        const finalRole = (role && ['ADMIN', 'OPERADOR'].includes(role)) ? role : 'CIUDADANO';

        const passwordHash = bcrypt.hashSync(String(password), 10);
        const user = new User({ name, email, password: passwordHash, role: finalRole });

        await this.userRepository.save(user);
        return user.toSafeJSON();
    }
}

module.exports = RegisterUserUseCase;
