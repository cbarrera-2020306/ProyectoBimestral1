// Rutas de funciones de usuario
import { Router } from "express"
import { deleteUser, get, getAll, update, updatePassword,login, register, test } from "./user.controller.js"
import { validateAdmin, validateJwt} from '../../middlewares/validate.jwt.js'
import { PasswordValidator, updateValidator, LoginValidator, registerValidator } from "../../helpers/validators.js"
// import { uploadProfilePicture } from "../../middlewares/multer.uploads.js";
import { deleteFileError } from "../../middlewares/delete.file.on.errors.js";
import { validateAdminRole, validateDeleteUser, validateLogin, validatePagination, validateRegister, validateUpdatePassword, validateUpdateUser } from "../../middlewares/validate.users.js";


const api = Router()

// Rutas publicas
api.post('/register',
    [
        // uploadProfilePicture.single('profilePicture'),
        validateRegister,
        registerValidator,
        deleteFileError
    ],
    register)

api.post('/login',[LoginValidator, validateLogin], login)

//Rutas privadas
                //Middleware
api.get('/test',[validateJwt, validateAdmin], test)

// Rutas privadas
api.get(
    '/', 
    [validateJwt, validateAdminRole, validatePagination],
    getAll
)
api.get(
    '/:id', 
    [validateJwt, validateAdminRole], 
    get
)
api.put(
    '/:id', 
    [validateJwt, validateUpdateUser, updateValidator],
    update
)
api.put(
    '/password/:id', 
    [
        validateJwt, 
        validateUpdatePassword
    ],
    updatePassword
)
api.delete(
    '/:id', 
    [validateJwt, validateDeleteUser], 
    deleteUser
)

export default api