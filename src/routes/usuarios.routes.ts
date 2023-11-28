import { Router } from 'express';
import usuariosControllers from '../controllers/usuarios.controllers';

const router = Router();

router.post('/login', usuariosControllers.login)
router.get('/', usuariosControllers.getAllUsuarios);
router.get('/:id', usuariosControllers.getUsuario);
router.post('/', usuariosControllers.insertUsuario);
router.put('/:id', usuariosControllers.updateUsuario);
router.patch('/:id', usuariosControllers.setActivoUsuario);

export { router };