import { Router } from 'express';
import usuariosControllers from '../controllers/usuarios.controllers';
import { checkAuth, verificarToken } from '../middleware/checkAuth';

const router = Router();

router.get('/verificarToken', verificarToken)
router.post('/login', usuariosControllers.login)
router.get('/', checkAuth as any, usuariosControllers.getAllUsuarios as any);
router.get('/:id', checkAuth as any, usuariosControllers.getUsuario as any);
router.post('/', checkAuth as any, usuariosControllers.insertUsuario as any);
router.put('/', checkAuth as any, usuariosControllers.updateUsuario as any);
router.patch('/:id', checkAuth as any, usuariosControllers.setActivoUsuario as any);
router.post('/cambiarPass', checkAuth as any, usuariosControllers.cambiarPassword as any);

export { router };