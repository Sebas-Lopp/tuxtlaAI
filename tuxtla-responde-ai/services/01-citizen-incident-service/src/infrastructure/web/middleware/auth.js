const jwt = require('jsonwebtoken');

const SECRET = () => process.env.JWT_SECRET || 'tuxtla-responde-secret';

// Middleware de autenticación por JWT compartido entre microservicios.
function auth(requiredRole) {
    return (req, res, next) => {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Autenticación requerida. Inicia sesión.' });
        }

        try {
            const payload = jwt.verify(token, SECRET());
            req.user = payload; // { id, email, role, name }

            if (requiredRole && payload.role !== requiredRole && payload.role !== 'ADMIN') {
                return res.status(403).json({ error: 'No tienes permisos para esta acción.' });
            }
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
    };
}

// Autenticación opcional: establece req.user si hay token válido, sin rechazar si no lo hay.
function optionalAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
        try {
            req.user = jwt.verify(token, SECRET());
        } catch (err) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
}

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
