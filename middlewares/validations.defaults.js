import Category from "../src/category/category.model.js";

export const protectDefaultCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Obtener la categoría por defecto "GENERAL"
        const defaultCategory = await Category.findOne({ name: "GENERAL" });

        // Verificar si la categoría existe y si coincide con la que se intenta eliminar
        if (defaultCategory && defaultCategory._id.toString() === id) {
            return res.status(403).send({
                success: false,
                message: "The default category 'GENERAL' cannot be deleted",
            });
        }

        next(); // Continuar con la eliminación si no es la categoría GENERAL
    } catch (err) {
        console.error("Error in protectDefaultCategory middleware:", err);
        res.status(500).send({
            success: false,
            message: "Error validating default category",
            error: err.message || err,
        });
    }
};