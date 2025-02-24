// Rutas de funciones de usuario
import { Router } from "express"
import { deleteUser, get, getAll, update, updatePassword,login, register, test } from "./user.controller.js"
import { validateJwt} from '../../middlewares/validate.jwt.js'
import { PasswordValidator, updateValidator, LoginValidator, registerValidator } from "../../helpers/validators.js"
import { uploadProfilePicture } from "../../middlewares/multer.uploads.js";
import { deleteFileError } from "../../middlewares/delete.file.on.errors.js";


const api = Router()

// Rutas publicas
api.post('/register',
    [
        uploadProfilePicture.single('profilePicture'),
        registerValidator,
        deleteFileError
    ],
    register)

api.post('/login',[LoginValidator], login)

//Rutas privadas
                //Middleware
api.get('/test', validateJwt, test)

// Rutas privadas
api.get(
    '/', 
    [validateJwt],
    getAll
)
api.get(
    '/:id', 
    [validateJwt], 
    get
)
api.put(
    '/:id',
    [updateValidator],
    update
)
api.put(
    '/:id/password',
    [PasswordValidator],
    updatePassword
)
api.delete(
    '/:id',
    deleteUser
)

export default api