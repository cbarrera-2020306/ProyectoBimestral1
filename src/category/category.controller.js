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
        res.send({ success: true, category: req.category })
    } catch (err) {
        res.status(500).send({ success: false, message: "Error fetching category", err })
    }
}

//  Crear una nueva categoría (Solo Admin)
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body

        const newCategory = new Category({ name, description })
        await newCategory.save()

        res.status(201).send({ success: true, message: "Category created successfully", newCategory })
    } catch (err) {
        res.status(500).send({ success: false, message: "Error creating category", err })
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        )

        res.send({ success: true, message: "Category updated successfully", category })
    } catch (err) {
        res.status(500).send({ success: false, message: "Error updating category", err })
    }
}

export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar la categoría a eliminar
        const categoryToDelete = await Category.findById(id);

        // Actualizar los productos que usaban la categoría eliminada
        await Product.updateMany({ category: id }, { category: defaultCategory._id });

        // Eliminar la categoría
        await Category.findByIdAndDelete(id);

        res.send({ success: true, message: "Category deleted successfully, and products reassigned to default category" });

    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).send({ success: false, message: "Error deleting category", err });
    }
}