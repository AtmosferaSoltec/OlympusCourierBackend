import { Router } from 'express';
import repartosControllers from '../controllers/repartos.controllers';

const router = Router();

router.get('/', repartosControllers.listarTodos);
router.get('/get/:id', repartosControllers.getReparto);
router.post('/', repartosControllers.insertar);
router.put('/:id', repartosControllers.actualizar);
router.delete('/:id', repartosControllers.eliminar);
router.post('/darConformidad', repartosControllers.darConformidad)

export { router };