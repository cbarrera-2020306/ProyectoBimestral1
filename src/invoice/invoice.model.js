import mongoose from 'mongoose'

const InvoiceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },  // Nombre del producto
        price: { type: Number, required: true, min: 0 },  // Precio al momento de la compra
        quantity: { type: Number, required: true, min: 1 },  // Cantidad comprada
        subtotal: { type: Number, required: true, min: 0 }  // Precio * Cantidad
    }],
    total: { type: Number, required: true, min: 0 },  // Suma de todos los subtotales
    status: { type: String, enum: ['PAID', 'CANCELLED'], default: 'PAID' },  // Estado de la factura
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Invoice', InvoiceSchema)
