// Ejecutar el proyecto
    // Desestructurar
    import { initServer } from "./configs/app.js";
    import { config } from "dotenv"; //Decirle a Node que se va usar DOTENV
    import { connect } from "./configs/mongo.js";
    
    config()
    initServer()
    connect()
    import dotenv from 'dotenv';
    dotenv.config();
    