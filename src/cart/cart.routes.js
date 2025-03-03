// cart.routes.js (Rutas del carrito)
import { Router } from 'express'
import { getCart, addToCart, removeFromCart, clearCart } from '../cart/cart.controller.js'
import { validateClient, validateJwt } from "../../middlewares/validate.jwt.js"

const api = Router()

api.get('/', [validateJwt, validateClient], getCart)
api.post('/add', [validateJwt, validateClient], addToCart)
api.delete('/remove/:productId', [validateJwt, validateClient], removeFromCart)
api.delete('/clear', [validateJwt, validateClient], clearCart)

export default api;
