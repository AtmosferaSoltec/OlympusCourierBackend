import { Router } from 'express';
import controller from '../controllers/usuarios.controllers';
import { checkAuth, verificarToken } from '../middleware/checkAuth';

const router = Router();

router.get('/verificarToken', verificarToken)
router.post('/login', controller.login)
router.get('/', checkAuth, controller.getAllUsuarios);
router.get('/:id', checkAuth, controller.getUsuario);
router.post('/', checkAuth, controller.insertUsuario);
router.put('/:id', checkAuth, controller.updateUsuario);
router.patch('/:id', checkAuth, controller.setActivoUsuario);
router.post('/cambiarPass', checkAuth, controller.cambiarPassword);

export { router };