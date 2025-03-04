import Product from "./product.model.js";
import Category from "../category/category.model.js";

export const addProduct = async (req, res) => {
    try {
        let { name, price, categoryId, stock, description, isBestSeller } = req.body;

        // Validaciones
        if (!description) {
            return res.status(400).send({ message: "Product description is required" });
        }

        if (!stock || stock < 0) {
            return res.status(400).send({ message: "Stock must be a positive number" });
        }

        // Buscar la categoría por ID
        let category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({ message: "Category not found" });
        }

        // Buscar si el producto ya existe en la misma categoría
        let existingProduct = await Product.findOne({ name, category: categoryId });

        if (existingProduct) {
            existingProduct.stock += stock;
            await existingProduct.save();
            return res.send({ message: "Stock updated successfully", product: existingProduct });
        }

        // Crear nuevo producto con el nombre de la categoría
        let product = new Product({
            name,
            price,
            category: categoryId,
            categoryName: category.name, // Guardar el nombre de la categoría
            stock,
            description,
            isBestSeller
        });

        await product.save();

        return res.send({ message: "Product added successfully", product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error adding product", err });
    }
};



export const getProducts = async (req, res) => {
    try {
        const { name, category, bestSellers, sortAZ, sortZA, sortPriceAsc, sortPriceDesc } = req.query;
        let filter = {};

        // Filtro por nombre (insensible a mayúsculas/minúsculas)
        if (name) {
            filter.name = { $regex: new RegExp(name, 'i') };
        }

        // Filtro por categoría usando categoryName en lugar de categoryId
        if (category) {
            filter.categoryName = { $regex: new RegExp(category, 'i') };
        }

        // Filtro para los productos más vendidos
        if (bestSellers === 'true') {
            filter.isBestSeller = true;
        }

        // Configuración de opciones de ordenamiento
        let sortOptions = {};
        if (sortAZ === 'A-Z') sortOptions.name = 1;
        if (sortZA === 'Z-A') sortOptions.name = -1;
        if (sortPriceAsc === 'priceAsc') sortOptions.price = 1;
        if (sortPriceDesc === 'priceDesc') sortOptions.price = -1;

        // Consulta con filtros y ordenamiento
        const products = await Product.find(filter).sort(sortOptions);
        return res.send(products);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error retrieving products', err });
    }
};

export const getProductById = async (req, res) => {
    try {
        let { id } = req.params;
        let product = await Product.findById(id);
        if (!product) return res.status(404).send({ message: "Product not found" });
        return res.send({ message: "Product found", product });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error retrieving product", err });
    }
};

export const updateProduct = async (req, res) => {
    try {
        let { id } = req.params;
        let { categoryId } = req.body;

        let updateData = { ...req.body };

        // Si se actualiza la categoría, también hay que actualizar el nombre
        if (categoryId) {
            let category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).send({ message: "Category not found" });
            }
            updateData.categoryName = category.name;
        }

        let updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) return res.status(404).send({ message: "Product not found" });

        return res.send({ message: "Product updated", updatedProduct });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error updating product", err });
    }
};



export const deleteProduct = async (req, res) => {
    try {
        let { id } = req.params;
        let deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) return res.status(404).send({ message: "Product not found" });
        return res.send({ message: "Product deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error deleting product", err });
    }
};
