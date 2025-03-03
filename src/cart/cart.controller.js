// cart.controller.js
import Cart from './cart.model.js'
import Product from '../product/product.model.js'

// Agregar producto al carrito
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id; // Obtener ID del usuario desde el token
        const { productId, quantity } = req.body

        const product = await Product.findById(productId)
        if (!product) return res.status(404).send({ message: 'Product not found' })

        // Verificar si hay suficiente stock
        if (product.stock < quantity) {
            return res.status(400).send({ message: `Not enough stock. Only ${product.stock} available.` })
        }

        let cart = await Cart.findOne({ user: userId })
        if (!cart) {
            cart = new Cart({ user: userId, products: [] })
        }

        const existingProduct = cart.products.find(item => item.product.equals(productId))
        if (existingProduct) {
            existingProduct.quantity += quantity
        } else {
            cart.products.push({ product: productId, quantity })
        }

        cart.updatedAt = Date.now()
        await cart.save()
        return res.status(200).send({ message: 'Product added to cart', cart })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error adding product to cart', err })
    }
}

// Ver carrito del usuario (solo el dueño del carrito)
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id // Obtener usuario desde el token

        const cart = await Cart.findOne({ user: userId }).populate('products.product', 'name price')
        if (!cart) return res.status(404).send({ message: 'Cart not found' })

        // Verificación de que el usuario autenticado es el dueño del carrito
        if (cart.user.toString() !== userId) {
            return res.status(403).send({ message: 'Unauthorized: This cart does not belong to you' })
        }

        return res.status(200).send({ message: 'Cart retrieved', cart })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error retrieving cart', err })
    }
};

// Eliminar una cantidad de un producto o su totalidad del carrito 
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId, quantity } = req.body 

        // Buscar el carrito del usuario
        const cart = await Cart.findOne({ user: userId })
        if (!cart) return res.status(404).send({ message: 'Cart not found' })

        // Verificación de propiedad del carrito
        if (cart.user.toString() !== userId) {
            return res.status(403).send({ message: 'Unauthorized: You can only modify your own cart' })
        }

        // Buscar el producto dentro del carrito
        const productIndex = cart.products.findIndex(item => item.product.equals(productId))

        if (productIndex === -1) {
            return res.status(404).send({ message: 'Product not found in cart' })
        }

        // Reducir la cantidad o eliminar el producto completamente si es necesario
        if (quantity >= cart.products[productIndex].quantity) {
            // Si la cantidad a eliminar es igual o mayor, quitar el producto del carrito
            cart.products.splice(productIndex, 1);
        } else {
            // Si la cantidad a eliminar es menor, solo restar
            cart.products[productIndex].quantity -= quantity
        }

        cart.updatedAt = Date.now();
        await cart.save();

        return res.status(200).send({ message: 'Product quantity updated in cart', cart })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error removing product from cart', err })
    }
};


// Vaciar carrito (solo el dueño del carrito)
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id // Obtener usuario desde el token
        const cart = await Cart.findOne({ user: userId })

        if (!cart) return res.status(404).send({ message: 'Cart not found' })

        // Verificación de propiedad del carrito
        if (cart.user.toString() !== userId) {
            return res.status(403).send({ message: 'Unauthorized: You can only clear your own cart' })
        }

        await Cart.findOneAndDelete({ user: userId })

        return res.status(200).send({ message: 'Cart cleared' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error clearing cart', err })
    }
};
