import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        maxLength: [50, "Product name can't exceed 50 characters"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price can't be negative"]
    },
    stock: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock can't be negative"]
    },
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    isBestSeller: {
        type: Boolean,
        default: false // Por defecto, los productos no son más vendidos
    },
    salesCount: {
        type: Number,
        default: 0, // Contador de ventas para determinar los más vendidos
        min: [0, "Sales count can't be negative"]
    }
});

export default model("Product", productSchema);
