import Category from "./category.model.js";
import Product from "../product/product.model.js"
import { existCategoryName } from "../../helpers/db.validators.js";


//  Obtener todas las categorías
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.send({ success: true, categories });
    } catch (err) {
        res.status(500).send({ success: false, message: "Error fetching categories", err });
    }
};


//  Obtener una sola categoría por ID
 
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la categoría por ID
        const category = await Category.findById(id);

        // Verificar si existe
        if (!category) {
            return res.status(404).send({ success: false, message: "Category not found" });
        }

        res.send({ success: true, category });
    } catch (err) {
        res.status(500).send({ success: false, message: "Error fetching category", err });
    }
};


//  Crear una nueva categoría (Solo Admin)
 
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        await existCategoryName(name);  // Verificar si la categoría ya existe

        const newCategory = new Category({ name, description });
        await newCategory.save();

        res.status(201).send({ success: true, message: "Category created successfully", newCategory });
    } catch (err) {
        res.status(400).send({ success: false, message: err.message });
    }
};


//  Actualizar una categoría (Solo Admin)

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!category) {
            return res.status(404).send({ success: false, message: "Category not found" });
        }

        res.send({ success: true, message: "Category updated successfully", category });
    } catch (err) {
        res.status(500).send({ success: false, message: "Error updating category", err });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si la categoría existe
        const categoryToDelete = await Category.findById(id);
        if (!categoryToDelete) {
            return res.status(404).send({ success: false, message: "Category not found" });
        }

        // No permitir eliminar la categoría GENERAL
        if (categoryToDelete.name === "GENERAL") {
            return res.status(403).send({ success: false, message: "Cannot delete the default category" });
        }

        // Buscar la categoría GENERAL
        const defaultCategory = await Category.findOne({ name: "GENERAL" });
        if (!defaultCategory) {
            return res.status(500).send({ success: false, message: "Default category not found. Please ensure it exists." });
        }

        // Actualizar los productos que usaban la categoría eliminada
        await Product.updateMany({ category: id }, { category: defaultCategory._id });

        // Eliminar la categoría
        await Category.findByIdAndDelete(id);

        res.send({ success: true, message: "Category deleted successfully, and products reassigned to default category" });

    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).send({ success: false, message: "Error deleting category", err });
    }
};
