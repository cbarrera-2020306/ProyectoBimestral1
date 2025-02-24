// Configuracion de variables de entorno

// Modular | + efectivo

"use strict"

// ECModules | ESModules
import express from 'express' //Servidor HTTP
import morgan from 'morgan' //Logs
import helmet from 'helmet' //Seguridad para HTTP
import cors from 'cors' //Acceso al API
import userRoutes from '../src/user/user.routes.js'
import { limiter } from '../middlewares/rate.limit.js'

const configs = (app)=>{
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))
    app.use(cors())
    app.use(helmet())
    app.use(limiter)
    app.use(morgan('dev'))
}

const routes = (app)=>{
    // app.use(userRoutes)
    //Buenas practicas de rutas
            //pre ruta general
    app.use('/v1/user', userRoutes)
}

// ESModules no acepta exports.
export const initServer = async() => {
    const app = express() //Instancia de express
    try {
        configs(app)
        routes(app)
        app.listen(process.env.PORT)
        console.log(`Server running in port ${process.env.PORT}`)
    } catch (err) {
        console.log('Server init failed', err)
    }
}