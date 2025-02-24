'use strict'
import Category from "../src/category/category.model.js";

export const initializeCategory = async () => {
    try {
        // Verificar si ya existe una categoría por defecto
        const defaultCategory = await Category.findOne();
        
        if (!defaultCategory) {
            // Crear la categoría por defecto si no existe
            const category = new Category({
                name: "GENERAL",
                description: "Categoria para temas generales"
            });

            await category.save();
            console.log("Default category created successfully");
        } else {
            console.log("Category already exist");
        }
    } catch (err) {
        console.error("Error initializing category:", err);
    }
};