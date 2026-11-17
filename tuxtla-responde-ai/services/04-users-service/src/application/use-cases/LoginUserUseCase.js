const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ email, password }) {
        if (!email || !password) {
            throw new Error('email y password son obligatorios.');
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas.');
        }

        const valid = bcrypt.compareSync(String(password), user.password_hash || user.password || '');
        if (!valid) {
            throw new Error('Credenciales inválidas.');
        }

        const secret = process.env.JWT_SECRET || 'tuxtla-responde-secret';
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            secret,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.created_at,
            },
        };
    }
}

module.exports = LoginUserUseCase;
