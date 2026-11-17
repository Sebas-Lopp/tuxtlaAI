const RegisterUserUseCase = require('../../../application/use-cases/RegisterUserUseCase');
const LoginUserUseCase = require('../../../application/use-cases/LoginUserUseCase');
const GetUsersUseCase = require('../../../application/use-cases/GetUsersUseCase');

class UserController {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.registerUserUseCase = new RegisterUserUseCase(userRepository);
        this.loginUserUseCase = new LoginUserUseCase(userRepository);
        this.getUsersUseCase = new GetUsersUseCase(userRepository);
    }

    async register(req, res) {
        try {
            const user = await this.registerUserUseCase.execute(req.body);
            res.status(201).json({ message: "Usuario registrado exitosamente", data: user });
        } catch (error) {
            res.status(400).json({ error: "No se pudo registrar el usuario", details: error.message });
        }
    }

    async login(req, res) {
        try {
            const result = await this.loginUserUseCase.execute(req.body);
            res.status(200).json({ message: "Sesión iniciada", data: result });
        } catch (error) {
            res.status(401).json({ error: "No se pudo iniciar sesión", details: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const users = await this.getUsersUseCase.execute();
            res.status(200).json({ message: "Usuarios obtenidos exitosamente", total: users.length, data: users });
        } catch (error) {
            res.status(500).json({ error: "No se pudieron obtener los usuarios", details: error.message });
        }
    }
}

module.exports = UserController;
