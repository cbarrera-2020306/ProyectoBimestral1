import User from '../src/user/user.model.js'
import { checkPassword } from '../utils/encrypt.js'


export const validateRegister = async (req, res, next) => {
    try {
        const { username } = req.body

        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).send({ message: 'Username already exists' })
        }

        next()
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error validating user', err })
    }
}

export const validateLogin = async (req, res, next) => {
    try {
        let { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required' })
        }

        let user = await User.findOne({ username })
        if (!user || !user.status) {
            return res.status(400).send({ message: 'Wrong username or password' })
        }

        if (!(await checkPassword(user.password, password))) {
            return res.status(400).send({ message: 'Wrong username or password' })
        }

        next()
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error validating login', err })
    }
}

export const validateAdminRole = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send({ success: false, message: 'Only admins can view users' })
    }
    next()
}

export const validatePagination = async (req, res, next) => {
    let { limit = 2, skip = 0 } = req.query

    limit = Number(limit)
    skip = Number(skip)

    if (isNaN(limit) || limit <= 0) {
        return res.status(400).send({ success: false, message: 'Limit must be a positive number' })
    }

    if (isNaN(skip) || skip < 0) {
        return res.status(400).send({ success: false, message: 'Skip must be a non-negative number' })
    }

    // Obtener la cantidad total de usuarios en la BD
    const totalUsers = await User.countDocuments()

    if (skip >= totalUsers) {
        return res.status(400).send({ success: false, message: 'No more users available' })
    }

    next()
}


export const validateUpdateUser = (req, res, next) => {
    const { role, status } = req.body

    if (!req.user) {
        return res.status(401).send({ success: false, message: 'Unauthorized' })
    }

    if (role && req.user.role !== 'ADMIN') {
        return res.status(403).send({ success: false, message: 'Only admins can change roles' })
    }

    if (status !== undefined) {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).send({ success: false, message: 'Only admins can change account status' })
        }

        if (req.user.role === 'ADMIN' && req.user.username !== 'cbarrera-2020306') {
            return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can change another admin\'s status' })
        }

        if (req.user.role === 'CLIENT' && req.user.role !== 'ADMIN') {
            return res.status(403).send({ success: false, message: 'Only admins can change client account status' })
        }
    }

    if (req.user.role !== 'ADMIN') {
        delete req.body.role
    }

    next()
}

export const validateUpdatePassword = async (req, res, next) => {
    try {
        const { id } = req.params
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).send({ success: false, message: 'Both current and new passwords are required' })
        }

        const user = await User.findById(id)
        if (!user) return res.status(404).send({ success: false, message: 'User not found' })

        if (user.username === 'cbarrera-2020306' && req.user.id !== user.id) {
            return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can update their own password' })
        }

        if (req.user.id !== user.id) {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).send({ success: false, message: 'Only the user or an ADMIN can update the password' })
            }

            if (user.role === 'ADMIN' && req.user.username !== 'cbarrera-2020306') {
                return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can update another ADMIN\'s password' })
            }
        }

        if (!await checkPassword(user.password, currentPassword)) {
            return res.status(401).send({ success: false, message: 'Current password is incorrect' })
        }

        next()
    } catch (err) {
        console.error(err)
        return res.status(500).send({ success: false, message: 'Validation error updating password', err })
    }
}

export const validateDeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        if (user.username === 'cbarrera-2020306') {
            return res.status(403).send({ success: false, message: 'Cannot deactivate the default ADMIN account' })
        }

        if (req.user.id !== user.id && req.user.role !== 'ADMIN') {
            return res.status(403).send({ success: false, message: 'Only ADMIN or the user themselves can deactivate this account' })
        }

        if (user.role === 'ADMIN' && req.user.username !== 'cbarrera-2020306') {
            return res.status(403).send({ success: false, message: 'Only cbarrera-2020306 can deactivate another ADMIN' })
        }

        next()
    } catch (err) {
        console.error(err)
        return res.status(500).send({ success: false, message: 'Validation error deactivating user', err })
    }
}
