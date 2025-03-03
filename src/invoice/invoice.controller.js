import Invoice from './invoice.model.js';
import Product from '../product/product.model.js';
import User from '../user/user.model.js';
import Cart from '../cart/cart.model.js';

export const createInvoice = async (req, res) => {
    try {
        const userId = req.user.id // Obtener ID del usuario desde el token

        // Buscar el carrito del usuario y poblar los productos
        const cart = await Cart.findOne({ user: userId }).populate('products.product')
        if (!cart || cart.products.length === 0) {
            return res.status(400).send({ message: 'Your cart is empty' })
        }

        // Calcular subtotales y total
        let total = 0
        const invoiceProducts = cart.products.map(item => {
            const subtotal = item.product.price * item.quantity
            total += subtotal
            return {
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                subtotal
            }
        })

        // Crear la factura
        const invoice = new Invoice({
            user: userId,
            products: invoiceProducts,
            total,
            status: 'PAID'  // La factura se genera solo si se paga
        })

        await invoice.save()

        // Vaciar el carrito del usuario después de generar la factura
        await Cart.findOneAndDelete({ user: userId })

        return res.status(201).send({ message: 'Invoice created successfully', invoice })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating invoice', err })
    }
}


// Obtener todas las facturas
export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('user', 'name username').populate('products.product', 'name price');
        if (invoices.length === 0) return res.status(404).send({ message: 'No invoices found' });

        return res.send({ message: 'Invoices retrieved successfully', invoices });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error retrieving invoices', err });
    }
};

// Ver todas las facturas de un usuario específico
export const getUserInvoices = async (req, res) => {
    try {
        const { userId } = req.params // Obtener el ID del usuario desde los parámetros

        const invoices = await Invoice.find({ user: userId }).populate('user', 'name email')

        if (!invoices.length) return res.status(404).send({ message: 'No invoices found for this user' })

        return res.status(200).send({ message: 'User invoices retrieved successfully', invoices })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error retrieving invoices', err })
    }
}

// Ver productos detallados de una factura
export const getInvoiceDetails = async (req, res) => {
    try {
        const { invoiceId } = req.params // Obtener ID de la factura desde la URL

        const invoice = await Invoice.findById(invoiceId).populate('products.product', 'name price')

        if (!invoice) return res.status(404).send({ message: 'Invoice not found' })

        return res.status(200).send({ message: 'Invoice details retrieved successfully', invoice })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error retrieving invoice details', err })
    }
}


// Actualizar factura (validación de stock incluida)
export const updateInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params // Obtener ID de la factura desde la URL
        const { products } = req.body // Lista de productos nuevos con cantidades

        // Buscar la factura
        const invoice = await Invoice.findById(invoiceId)
        if (!invoice) return res.status(404).send({ message: 'Invoice not found' })

        let total = 0
        const updatedProducts = []

        for (const item of products) {
            const product = await Product.findById(item.productId)
            if (!product) return res.status(404).send({ message: `Product not found: ${item.productId}` })

            // Validar que haya suficiente stock
            if (item.quantity > product.stock) {
                return res.status(400).send({ message: `Insufficient stock for ${product.name}` })
            }

            const subtotal = product.price * item.quantity
            total += subtotal

            updatedProducts.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal
            })
        }

        // Actualizar factura
        invoice.products = updatedProducts
        invoice.total = total
        invoice.updatedAt = Date.now()

        await invoice.save()

        return res.status(200).send({ message: 'Invoice updated successfully', invoice })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating invoice', err })
    }
}

// Desactivar factura (cambiar estado a "CANCELLED")
export const cancelInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id);

        if (!invoice) return res.status(404).send({ message: 'Invoice not found' });

        // Restaurar stock de los productos en la factura
        for (let item of invoice.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        invoice.status = 'CANCELLED';
        await invoice.save();

        return res.send({ message: 'Invoice cancelled successfully', invoice });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error cancelling invoice', err });
    }
};
