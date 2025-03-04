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
        let data = req.body

        let user = new User(data)
        user.password = await encrypt(user.password)
        user.role = 'CLIENT'
        user.status = true

        await user.save()
        return res.send({ message: `Registered successfully. Login with username: ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'General error registering user', err })
    }
}


// Login
// Login
export const login = async (req, res) => {
    try {
        let { username, password } = req.body
        let user = await User.findOne({ username })

        let loggedUser = {
            uid: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        }

        let token = await generateJwt(loggedUser)
        return res.send({ message: `Welcome ${user.name}`, loggedUser, token })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'General error with login function' })
    }
}

// Get all users
export const getAll = async (req, res) => {
    try {
        let { limit = 2, skip = 0 } = req.query
        limit = Number(limit)
        skip = Number(skip)

        const users = await User.find().skip(skip).limit(limit)
        const totalUsers = await User.countDocuments()

        return res.send({
            success: true,
            message: 'Users found',
            users,
            totalUsers,
            pageSize: limit,
            currentPage: Math.ceil(skip / limit) + 1
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ success: false, message: 'General error', err })
    }
}

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

export const update = async (req, res) => {
    try {
        const { id } = req.params

        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

        if (!updatedUser) {
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        return res.send({ success: true, message: 'User updated successfully', user: updatedUser })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ success: false, message: 'General error updating user', err })
    }
}

// controllers/user.controller.js
export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params
        const { newPassword } = req.body

        const user = await User.findById(id)

        user.password = await encrypt(newPassword)
        await user.save()

        return res.send({ success: true, message: 'Password updated successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ success: false, message: 'General error updating password', err })
    }
}


// Deactivate user (instead of delete)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        user.status = false
        await user.save()

        return res.send({ success: true, message: 'User deactivated successfully', user })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ success: false, message: 'General error deactivating user', err })
    }
}

