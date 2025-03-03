import { Router } from "express"
import { protectDefaultCategory } from "../../middlewares/validations.defaults.js"
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "./category.controller.js"
import { validateJwt, validateAdmin } from "../../middlewares/validate.jwt.js"

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
    [validateJwt, validateAdmin], 
    createCategory
)

api.put(
    "/update/:id", 
    [validateJwt, validateAdmin], 
    updateCategory
)

api.delete(
    "/delete/:id", 
    [validateJwt, validateAdmin],
    protectDefaultCategory, 
    deleteCategory
)

export default api