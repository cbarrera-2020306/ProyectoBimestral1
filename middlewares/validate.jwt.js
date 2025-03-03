'use strict';

import jwt from "jsonwebtoken";

// Validar que el token sea válido y no haya expirado
export const validateJwt = async (req, res, next) => {
    try {
        // Obtener la llave secreta del .env
        let secretKey = process.env.SECRET_KEY;

        // Obtener el token del header Authorization
        let { authorization } = req.headers;

        // Verificar si el token viene en el request
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized. Token required" });
        }

        // Extraer el token eliminando "Bearer "
        let token = authorization.split(" ")[1];

        // Verificar y decodificar el token
        let user = jwt.verify(token, secretKey);

        // Inyectar la información del usuario en la solicitud
        req.user = user;

        // Continuar con la siguiente función
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(403).json({ message: "Invalid token or expired" });
    }
};

// Middleware para validar que el usuario sea CLIENT
export const validateClient = (req, res, next) => {
    try {
        if (req.user.role !== "CLIENT") {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    } catch (err) {
        console.error("Role validation error:", err);
        return res.status(500).json({ message: "Error validating role" });
    }
};
export const validateAdmin = (req, res, next) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Access denied." });
        }
        next();
    } catch (err) {
        console.error("Role validation error:", err);
        return res.status(500).json({ message: "Error validating role" });
    }
};