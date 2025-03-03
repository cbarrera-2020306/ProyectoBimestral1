import User from '../user/user.model.js';
import { checkPassword, encrypt } from '../../utils/encrypt.js';
import { generateJwt } from '../../utils/jwt.js';

// Test
export const test = (req, res) => {
    console.log('Test is running');
    return res.send({ message: 'Test is running' });
};

// Register
export const register = async (req, res) => {
    try {
        let data = req.body;

        // Validaciones necesarias (ejemplo: username único)
        const existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username already exists' });
        }

        let user = new User(data);
        user.password = await encrypt(user.password);
        user.role = 'CLIENT'; // Asignar rol por defecto
        user.status = true; // Activar usuario por defecto

        await user.save();
        return res.send({ message: `Registered successfully. Login with username: ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error registering user', err });
    }
};

// Login
export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ username });

        if (user && await checkPassword(user.password, password)) {
            let loggedUser = {
                uid: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            };

            let token = await generateJwt(loggedUser);
            return res.send({ message: `Welcome ${user.name}`, loggedUser, token });
        }

        return res.status(400).send({ message: 'Wrong username or password' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error with login function' });
    }
};

// Get all users
export const getAll = async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query;
        const users = await User.find().skip(skip).limit(limit);

        if (users.length === 0) return res.status(404).send({ message: 'Users not found', success: false });

        return res.send({ success: true, message: 'Users found', users, total: users.length });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error', err });
    }
};

// Get user by ID
export const get = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).send({ success: false, message: 'User not found' });

        return res.send({ success: true, message: 'User found', user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: 'General error', err });
    }
};

// Update user
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, surname, username, email, phone, role } = req.body;

        // Validar si el usuario existe
        const user = await User.findById(id);
        if (!user) return res.status(404).send({ success: false, message: 'User not found' });

        // Si un usuario intenta actualizar el rol y no es admin, se restringe la actualización
        if (role && req.user.role !== 'ADMIN') {
            return res.status(403).send({ success: false, message: 'Only admins can change roles' });
        }

        // Eliminar el campo 'role' si no es ADMIN, ya que no se puede actualizar sin permiso
        if (req.user.role !== 'ADMIN') {
            delete req.body.role;
        }

        // Actualizar el usuario con los nuevos datos, excluyendo el 'role' si no es admin
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        return res.send({ success: true, message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: 'General error updating user', err });
    }
};


// Update password
export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).send({ success: false, message: 'Both current and new passwords are required' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).send({ success: false, message: 'User not found' });

        // Si el usuario a modificar es cbarrera-2020306
        if (user.username === 'cbarrera-2020306') {
            // Solo él mismo puede cambiar su propia contraseña
            if (req.user.id !== user.id) {
                return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can update their own password' });
            }
        } else {
            // Si el usuario que intenta cambiar la contraseña NO es el mismo
            if (req.user.id !== user.id) {
                // Solo los ADMIN pueden cambiar contraseñas de otros usuarios
                if (req.user.role !== 'ADMIN') {
                    return res.status(403).send({ success: false, message: 'Only the user or an ADMIN can update the password' });
                }

                // Si el usuario a modificar es un ADMIN
                if (user.role === 'ADMIN') {
                    // Solo cbarrera-2020306 puede cambiar la contraseña de otros ADMIN
                    if (req.user.username !== 'cbarrera-2020306') {
                        return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can update another ADMIN\'s password' });
                    }
                }
            }
        }

        // Verificar que la contraseña actual es correcta
        if (!await checkPassword(user.password, currentPassword)) {
            return res.status(401).send({ success: false, message: 'Current password is incorrect' });
        }

        // Actualizar la contraseña
        user.password = await encrypt(newPassword);
        await user.save();

        return res.send({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: 'General error updating password', err });
    }
};

// Deactivate user (instead of delete)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        //  No permitir desactivar al ADMIN por defecto 'cbarrera-2020306' en ningún caso
        if (user.username === 'cbarrera-2020306') {
            return res.status(403).send({ success: false, message: 'Cannot deactivate the default ADMIN account' });
        }

        //  Si el usuario intenta desactivarse a sí mismo, se permite (excepto cbarrera-2020306)
        if (req.user.id === user.id) {
            user.status = false;
            await user.save();
            return res.send({ success: true, message: 'User deactivated successfully', user });
        }

        //  Si quien hace la petición NO es un ADMIN, no puede desactivar a nadie más
        if (req.user.role !== 'ADMIN') {
            return res.status(403).send({ success: false, message: 'Only ADMIN or the user themselves can deactivate this account' });
        }

        // Si el usuario a desactivar es un ADMIN
        if (user.role === 'ADMIN') {
            //  Solo cbarrera-2020306 puede desactivar a otro ADMIN
            if (req.user.username !== 'cbarrera-2020306') {
                return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can deactivate another ADMIN' });
            }
        }

        //  Desactivar el usuario
        user.status = false;
        await user.save();

        return res.send({ success: true, message: 'User deactivated successfully', user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: 'General error deactivating user', err });
    }
};
