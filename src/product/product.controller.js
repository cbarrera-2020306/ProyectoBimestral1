import Product from "./product.model.js";

export const addProduct = async (req, res) => {
    try {
        let data = req.body;
        let product = new Product(data);
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

        // Filtro por nombre (búsqueda insensible a mayúsculas/minúsculas)
        if (name) {
            filter.name = { $regex: new RegExp(name, 'i') };
        }

        // Filtro por categoría (búsqueda insensible a mayúsculas/minúsculas)
        if (category) {
            filter.category = { $regex: new RegExp(category, 'i') };
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
        return res.status(500).send({ message: 'Error retrieving products' });
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
        let updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
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
