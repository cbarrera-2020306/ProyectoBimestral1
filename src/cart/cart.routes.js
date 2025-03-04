// cart.routes.js (Rutas del carrito)
import { Router } from 'express'
import { getCart, addToCart, removeFromCart, clearCart } from '../cart/cart.controller.js'
import { validateClient, validateJwt } from "../../middlewares/validate.jwt.js"
import {validateUser, validateProductsArray, validateProductStock, validateCartExists} from '../../middlewares/validations.cart.js'
const api = Router()

api.get('/', [validateJwt,validateUser, validateCartExists], getCart)
api.post('/add', [validateJwt, validateUser, validateProductsArray, validateProductStock, validateCartExists], addToCart)
api.delete('/remove/', [validateJwt,validateUser, validateProductsArray, validateCartExists], removeFromCart)
api.post('/clear', [validateJwt,validateUser, validateCartExists], clearCart)

export default api;
