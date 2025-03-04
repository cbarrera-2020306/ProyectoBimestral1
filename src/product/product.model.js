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
        type: Schema.Types.ObjectId, // Se guarda la referencia a la categoría
        ref: "Category",
        required: [true, "Product category is required"]
    },
    categoryName: {
        type: String, // Se guarda el nombre de la categoría
        required: true
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    salesCount: {
        type: Number,
        default: 0,
        min: [0, "Sales count can't be negative"]
    }
});

export default model("Product", productSchema);
