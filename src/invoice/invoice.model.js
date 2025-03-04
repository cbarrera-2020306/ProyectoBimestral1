import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }, // Se agrega el nombre del usuario
    purchaseNumber: { type: Number, required: true, unique: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['PAID', 'PENDING'], default: 'PAID' }
}, { timestamps: true })

export default mongoose.model('Invoice', invoiceSchema)
