import { Router } from "express";
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct } from "./product.controller.js";
import { validateAdmin, validateJwt } from "../../middlewares/validate.jwt.js";

const api = Router();

api.get("/",validateJwt, getProducts);
api.get("/find/:id",validateJwt, getProductById);
api.post("/add",validateJwt, validateAdmin, addProduct);
api.put("/update/:id",validateJwt,validateAdmin, updateProduct);
api.delete("/delete/:id",validateJwt,validateAdmin, deleteProduct);

export default api;