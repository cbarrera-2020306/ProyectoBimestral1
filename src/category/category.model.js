import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
            uppercase: true,
            maxLength: [50, `Category name can't exceed 50 characters`]
        },
        description: {
            type: String,
            maxLength: [200, `Description can't exceed 200 characters`]
        }
    },
);

export default model("Category", categorySchema);