import { Router } from 'express';
import controller from '../controllers/cliente.controllers';
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.get('/', checkAuth, controller.getAllClientes);
router.get('/:id', checkAuth, controller.getCliente);
router.get('/search/:datos', checkAuth, controller.searchCliente)
router.post('/', checkAuth, controller.insertCliente);
router.put('/:id', checkAuth, controller.updateCliente);
router.patch('/:id', checkAuth, controller.setActivoCliente);

export { router };