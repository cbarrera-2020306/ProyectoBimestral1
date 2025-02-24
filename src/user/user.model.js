// Modelo de usuario

import mongoose, { Schema, model } from "mongoose";

const userSchema = Schema(
    {
        name: {
            type: String,
            maxLength: [25, `Can't be overcome 25 characters`],
            required: [true, 'Name is required']
        },
        surname: {
            type: String,
            maxLength: [25, `Ca't over come 25 characters`],
            required: [true, 'Surname is required']
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            maxLength: [25, `Ca't over come 25 characters`]
        },
        email: {
            type: String,
            //Vamos a ver que pasa si no es unico
            // isEmail: true,   //Express validator
            required: [true, 'Email is reuired'],
            // match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: [8, 'Password must be 8 characters'],
            maxLength: [100, `Can't be overcome 16 characters`],
            // match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm]
        },
        profilePicture: {
            type: String //Path (ruta) en el servidor
        },
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            maxLength: [13, `Can't be overcome 8 numbers`],
            minLength: [8, `Phone must be 8 numbers`]
        },
        role:{
            type: String,
            required: [true, 'Role is required'],
            uppercase: true,
            enum: ['ADMIN', 'CLIENT']
        },
        status:{
            type: Boolean,
            default: true
        }
    }
)

// Modificar el toJSON para excluir datos en la respuesta 
userSchema.methods.toJSON = function(){
    const { __v, password, ...user } = this.toObject()  //toObject sirve para convertir un documento de mongoDB a object
    // user.uid = _id
    return user
}

// Crear y exportar el modelo
export default model('User', userSchema)