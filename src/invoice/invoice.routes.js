import { Router } from 'express';
import { 
    createInvoice, 
    getAllInvoices,
    updateInvoice, 
    cancelInvoice, 
    getUserInvoices,
    getInvoiceDetails
} from './invoice.controller.js';
import { validateAdmin, validateJwt } from '../../middlewares/validate.jwt.js';

const api = Router();

// Crear una nueva factura
api.post('/create',[validateJwt], createInvoice)

// Obtener todas las facturas
api.get('/all',[validateJwt, validateAdmin], getAllInvoices)

// Obtener facturas de un usuario específico
api.get('/user/:userId',[validateJwt, validateAdmin], getUserInvoices)

// Obtener los detalles de una factura
api.get('/details/:invoiceId', [validateJwt, validateAdmin], getInvoiceDetails)

// Editar una factura
api.put('/update/:id',[validateJwt, validateAdmin], updateInvoice)

// Cancelar una factura
api.put('/cancel/:id',[validateJwt, validateAdmin], cancelInvoice)

export default api;
