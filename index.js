// Ejecutar el proyecto
    // Desestructurar
    import { initServer } from "./configs/app.js";
    import { config } from "dotenv"; //Decirle a Node que se va usar DOTENV
    import { connect } from "./configs/mongo.js";
    import dotenv from 'dotenv';
    
    config()
    initServer()
    connect()
    dotenv.config();
    