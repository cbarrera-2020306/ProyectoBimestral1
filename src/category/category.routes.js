import { Router } from "express"
import { verifyAdmin } from "../../middlewares/auth.middleware.js"
import { protectDefaultCategory } from "../../middlewares/validations.defaults.js"
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "./category.controller.js"
import { validateJwt } from "../../middlewares/validate.jwt.js"

const api = Router()

api.get(
    "/", 
    getCategories
)

api.get(
    "/:id", 
    getCategoryById
)

api.post(
    "/register", 
    [validateJwt],
    verifyAdmin, 
    createCategory
)

api.put(
    "/update/:id", 
    [validateJwt],
    verifyAdmin, 
    updateCategory
)

api.delete(
    "/delete/:id", 
    [validateJwt],
    verifyAdmin, 
    protectDefaultCategory, 
    deleteCategory
)
export default api