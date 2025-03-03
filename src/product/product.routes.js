import { Router } from "express";
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct } from "./product.controller.js";
import { validateAdmin, validateJwt } from "../../middlewares/validate.jwt.js";

const api = Router();

api.get("/",validateJwt, getProducts);
api.get("/:id",validateJwt, getProductById);
api.post("/",validateJwt, validateAdmin, addProduct);
api.put("/:id",validateJwt,validateAdmin, updateProduct);
api.delete("/:id",validateJwt,validateAdmin, deleteProduct);

export default api;