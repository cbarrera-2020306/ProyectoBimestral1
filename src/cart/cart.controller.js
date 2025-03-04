import Cart from './cart.model.js'
import Product from '../product/product.model.js'

export const addToCart = async (req, res) => {
    try {
        const { products } = req.body
        const cart = req.cart

        for (const { productId, quantity } of products) {
            const existingProduct = cart.products.find(p => p.product.equals(productId))

            if (existingProduct) {
                existingProduct.quantity += quantity
            } else {
                // Asegurarte de que el producto se guarda con el ID correcto
                cart.products.push({ product: productId, quantity })
            }
        }

        cart.updatedAt = Date.now()
        await cart.save()

        // Refrescar el carrito y hacer el populate para obtener la información completa del producto
        const populatedCart = await Cart.findById(cart._id)
            .populate({ path: 'products.product', select: 'name price stock' }) // Poblar el campo 'product'
            .select('-__v')

        return res.status(200).send({ message: "Products added to cart", cart: populatedCart })
    } catch (err) {
        return res.status(500).send({ message: "Error adding products to cart", err })
    }
}

export const getCart = async (req, res) => {
    try {
        const cart = req.cart

        if (cart.products.length === 0) {
            return res.status(200).send({ message: 'El carrito está vacío.' })
        }

        return res.status(200).send({ message: 'Carrito recuperado', cart })
    } catch (err) {
        return res.status(500).send({ message: 'Error al recuperar el carrito', err })
    }
}

export const clearCart = async (req, res) => {
    try {
      const userId = req.user.uid
      const cart = await Cart.findOne({ user: userId })
  
      if (!cart) return res.status(404).send({ message: 'El usuario no tiene un carrito de compras en este momento.' })
  
      // Vaciar el carrito en lugar de eliminarlo
      cart.products = []
      await cart.save()
  
      return res.status(200).send({ message: 'El carrito ha sido vaciado exitosamente.' })
    } catch (err) {
      console.error("Error al vaciar el carrito:", err)
      return res.status(500).send({ message: 'Error al vaciar el carrito', err })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { cart } = req
        const { products } = req.body

        // Recorrer los productos enviados para eliminarlos o actualizar cantidades
        products.forEach(({ productId, quantity }) => {
            const productIndex = cart.products.findIndex(item => item.product.equals(productId))

            if (productIndex !== -1) {
                if (quantity >= cart.products[productIndex].quantity) {
                    cart.products.splice(productIndex, 1) // Eliminar el producto
                } else {
                    cart.products[productIndex].quantity -= quantity // Reducir cantidad
                }
            }
        })

        cart.updatedAt = Date.now()
        await cart.save()

        return res.status(200).send({ message: 'Productos actualizados en el carrito', cart })
    } catch (err) {
        console.error("Error al actualizar el carrito:", err)
        return res.status(500).send({ message: 'Error al actualizar el carrito', error: err })
    }
}
