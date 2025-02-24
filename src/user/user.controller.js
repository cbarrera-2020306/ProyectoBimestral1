// Logica de autenticacioin 
import User from '../user/user.model.js'
import { checkPassword, encrypt } from '../../utils/encrypt.js'
import { generateJwt } from '../../utils/jwt.js'

// Test 
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

// Register 
export const register = async (req ,res) => {
    try {
        //Capturar los datos
        let data = req.body
        //Aqui van validaciones
        let user = new User(data)

        // Encriptar la password 
        user.password = await encrypt(user.password)
        //Asignar rol por defecto
        user.role = 'CLIENT'
        //Guardar
        await user.save()
        //Respomder al usuario
        return res.send({message: `Registered succesfully, can be logged with username: ${user.username}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with registering user', err})
    }
}



// Login 
export const login = async (req, res) => {
    try {
        //Capturar los datops (body)
        let { username, password} = req.body
        //Validar que el usuario exista
        let user = await User.findOne({username})  //findOne({username}) = ({username: username})
        //Verificar que la contraseña coincida
        if(user && await checkPassword(user.password, password)){
            let loggedUser = {  //No puede ir data sencible
                uid: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
            //PENDIENTE: generar el Token
            let token = await generateJwt(loggedUser)
            //responder al usuario
            return res.send(
                {
                    message: `Welcome ${user.name}`,
                    loggedUser,
                    token
                }
            )
        }
        return res.status(400).send({message: 'Wrong email or password'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with login fuction'})
    }
}


// CRUD
export const getAll = async (req, res) => {
    try {
        //Configuraciones de paginacion
        const { limit = 20, skip = 0} = req.query
        const users = await User.find()
            .skip(skip)
            .limit(limit)

        if(users.length === 0) return res.status(404).send({message: 'Users not found', succes: false})
        return res.send(
            {
                succes: true,
                message: 'Users found',
                users,
                total: users.length
            }
        )
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Generl; error', err})
    }
}

// Obtener un usuario por su id
export const get = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if(!User) return res.status(404).send(
            {
                succes: false, 
                message: 'User not found'
            }
        )
        return res.send(
            {
                succes: true,
                message: 'User found',
                user
            }
        )
    } catch (err) {
        console.error(err)
        return res.status(500).send(
            {
                succes: false,
                message: 'General error', 
                err
            }
        )
    }
}

// update normal (sin imagenes)
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener los valores desde los headers
        const name = req.headers["name"]
        const surname = req.headers["surname"]
        const username = req.headers["username"]
        const email = req.headers["email"]
        const phone = req.headers["phone"]

        if (!name || !surname || !username || !email || !phone) {
            return res.status(400).send({
                success: false,
                message: "All fields are required in headers"
            });
        }

        // Buscar y actualizar el usuario
        const user = await User.findByIdAndUpdate(
            id,
            { name, surname, username, email, phone },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        return res.send({
            success: true,
            message: "User updated successfully",
            user
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: "General error",
            err
        });
    }
};

// update de password 
export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener contraseñas desde los headers
        const currentPassword = req.headers["currentpassword"];
        const newPassword = req.headers["newpassword"];

        // Validar que ambas contraseñas estén presentes
        if (!currentPassword || !newPassword) {
            return res.status(400).send({
                success: false,
                message: "Both current and new passwords are required in headers",
            });
        }

        // Buscar al usuario en la base de datos
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Verificar si la contraseña actual es correcta
        const passwordMatch = await checkPassword(user.password, currentPassword);
        if (!passwordMatch) {
            return res.status(401).send({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await encrypt(newPassword);

        // Actualizar la contraseña en la base de datos
        user.password = hashedPassword;
        await user.save();

        return res.send({
            success: true,
            message: "Password updated successfully",
        });
    } catch (err) {
        console.error("Error updating password:", err);
        return res.status(500).send({
            success: false,
            message: "General error updating password",
            error: err.message,
        });
    }
};

// Eliminar un usuario
// export const deleteUser = async (req, res) => {
//     try {
//         const { id } = req.params; // Obtener el ID del usuario desde los parámetros

//         // Buscar y eliminar el usuario por su ID
//         const user = await User.findByIdAndDelete(id);

//         // Verificar si el usuario existe
//         if (!user) {
//             return res.status(404).send({
//                 success: false,
//                 message: 'User not found',
//             });
//         }

//         return res.send({
//             success: true,
//             message: 'User deleted successfully',
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).send({
//             success: false,
//             message: 'General error deleting user',
//             err,
//         });
//     }
// };


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del usuario desde los parámetros

        // Buscar el usuario en la base de datos
        const user = await User.findById(id);

        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        // Verificar que el usuario tenga rol CLIENT antes de desactivarlo
        if (user.role !== 'CLIENT') {
            return res.status(403).send({
                success: false,
                message: 'Only CLIENT users can be deactivated',
            });
        }

        // Desactivar el usuario (cambiar estado a false)
        user.status = false;
        await user.save();

        return res.send({
            success: true,
            message: 'User deactivated successfully',
            user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: 'General error deactivating user',
            err,
        });
    }
};