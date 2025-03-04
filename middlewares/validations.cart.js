import Cart from '../src/cart/cart.model.js'
import Product from '../src/product/product.model.js'

export const validateUser = (req, res, next) => {
    const { uid, name } = req.user
    if (!uid) return res.status(401).send({ message: "Unauthorized. User ID is missing." })

    req.userData = { uid, name }
    next()
}

export const validateProductsArray = (req, res, next) => {
    const { products } = req.body
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).send({ message: "Products array is required and cannot be empty" })
    }
    next()
}

export const validateProductStock = async (req, res, next) => {
    try {
        for (const item of req.body.products) {
            const { productId, quantity } = item
            const product = await Product.findById(productId)

            if (!product) return res.status(404).send({ message: `Product ${productId} not found` })
            if (product.stock < quantity) {
                return res.status(400).send({ message: `Not enough stock for ${product.name}. Only ${product.stock} available.` })
            }
        }
        next()
    } catch (err) {
        return res.status(500).send({ message: "Error validating product stock", err })
    }
}

export const validateCartExists = async (req, res, next) => {
    try {
        const { uid } = req.user
        const cart = await Cart.findOne({ user: uid })
            .populate({ path: 'products.product', select: 'name price' }) // Popular productos
            .select('-__v') // Oculta el campo __v

        if (!cart) {
            return res.status(404).send({ message: 'Carrito no encontrado' })
        }

        req.cart = cart
        next()
    } catch (err) {
        console.error("Error al buscar el carrito:", err)
        return res.status(500).send({ message: 'Error al verificar el carrito', error: err })
    }
}
