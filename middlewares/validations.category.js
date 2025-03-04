import Category from '../src/category/category.model.js'
import Product from '../src/product/product.model.js'

export const validateCategoryExists = async (req, res, next) => {
    try {
        const { id } = req.params

        const category = await Category.findById(id).select('-__v') //  Excluye __v
        if (!category) {
            return res.status(404).send({ success: false, message: "Category not found" })
        }

        req.category = category
        next()
    } catch (err) {
        console.error("Error fetching category:", err)
        return res.status(500).send({ success: false, message: "Error fetching category", err })
    }
}

export const validateCategoryPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 5 //  5 categorías por página
        const skip = (page - 1) * limit

        const categories = await Category.find().select('-__v').skip(skip).limit(limit)
        const totalCategories = await Category.countDocuments()

        if (categories.length === 0) {
            return res.status(404).send({ success: false, message: "No categories found" })
        }

        req.categories = {
            categories,
            totalPages: Math.ceil(totalCategories / limit),
            currentPage: page
        }

        next()
    } catch (err) {
        console.error("Error fetching categories:", err)
        return res.status(500).send({ success: false, message: "Error fetching categories", err })
    }
}

export const validateAdminRole = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send({ success: false, message: 'Only admins can view users' })
    }
    next()
}

export const validateCategoryCreation = async (req, res, next) => {
    try {
        const { name, description } = req.body

        if (!name || !description) {
            return res.status(400).send({ success: false, message: "Name and description are required" })
        }

        const existingCategory = await Category.findOne({ name })
        if (existingCategory) {
            return res.status(400).send({ success: false, message: "Category already exists" })
        }

        next()
    } catch (err) {
        console.error("Error validating category creation:", err)
        return res.status(500).send({ success: false, message: "Error validating category creation", err })
    }
}

export const validateCategoryUpdate = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        if (!name || !description) {
            return res.status(400).send({ success: false, message: "Name and description are required" })
        }

        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).send({ success: false, message: "Category not found" })
        }

        next()
    } catch (err) {
        console.error("Error validating category update:", err)
        return res.status(500).send({ success: false, message: "Error validating category update", err })
    }
}

export const validateCategoryDeletion = async (req, res, next) => {
    try {
        const { id } = req.params

        // Verificar si la categoría existe
        const categoryToDelete = await Category.findById(id)
        if (!categoryToDelete) {
            return res.status(404).send({ success: false, message: "Category not found" })
        }

        // No permitir eliminar la categoría GENERAL
        if (categoryToDelete.name === "GENERAL") {
            return res.status(403).send({ success: false, message: "Cannot delete the default category" })
        }

        // Buscar la categoría GENERAL
        const defaultCategory = await Category.findOne({ name: "GENERAL" })
        if (!defaultCategory) {
            return res.status(500).send({ success: false, message: "Default category not found. Please ensure it exists." })
        }

        // Verificar si hay productos asociados a la categoría eliminada
        const productsUsingCategory = await Product.find({ category: id })
        if (productsUsingCategory.length > 0) {
            // Actualizar los productos para que usen la categoría "GENERAL" y actualizar el name de la categoría
            const updatedProducts = await Product.updateMany(
                { category: id },
                {
                    category: defaultCategory._id,
                    categoryName: defaultCategory.name  // Actualizamos también el nombre de la categoría
                }
            )

            // Verificar si la actualización fue exitosa
            if (updatedProducts.modifiedCount === 0) {
                return res.status(500).send({ success: false, message: "No products were updated" })
            }

            console.log(`${updatedProducts.modifiedCount} products have been reassigned to GENERAL with updated categoryName`)
        }

        // Eliminar la categoría después de reasignar los productos
        await Category.findByIdAndDelete(id)

        return res.status(200).send({ success: true, message: "Category deleted successfully, and products reassigned to default category" })

    } catch (err) {
        console.error("Error validating category deletion:", err)
        return res.status(500).send({ success: false, message: "Error validating category deletion", err })
    }
}
