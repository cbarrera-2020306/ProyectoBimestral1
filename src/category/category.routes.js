import { Router } from "express"
import { protectDefaultCategory } from "../../middlewares/validations.defaults.js"
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "./category.controller.js"
import { validateJwt} from "../../middlewares/validate.jwt.js"
import { validateAdminRole, validateCategoryCreation, validateCategoryDeletion, validateCategoryExists, validateCategoryPagination, validateCategoryUpdate } from "../../middlewares/validations.category.js"

const api = Router()

api.get(
    "/", 
    validateJwt,
    validateCategoryPagination,
    getCategories
)

api.get(
    "/:id",
    validateJwt,
    validateCategoryExists,
    getCategoryById
)

api.post(
    "/register", 
    [validateJwt, validateAdminRole, validateCategoryCreation], 
    createCategory
)

api.put(
    "/update/:id", 
    [validateJwt, validateAdminRole, validateCategoryUpdate], 
    updateCategory
)

api.delete(
    "/delete/:id", 
    [validateJwt, validateAdminRole, validateCategoryDeletion],
    protectDefaultCategory, 
    deleteCategory
)

export default api