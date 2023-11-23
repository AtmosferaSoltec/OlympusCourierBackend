import express from 'express';
import usuariosControllers from '../controllers/usuarios.controllers';

const usuarioRoutes = express.Router();

usuarioRoutes.post('/usuarios/login', usuariosControllers.login)
usuarioRoutes.get('/usuarios', usuariosControllers.getAllUsuarios);
usuarioRoutes.get('/usuarios/get/:id', usuariosControllers.getUsuario);
usuarioRoutes.post('/usuarios', usuariosControllers.insertUsuario);
usuarioRoutes.put('/usuarios/:id', usuariosControllers.updateUsuario);
usuarioRoutes.delete('/usuarios/:id', usuariosControllers.deleteUsuario);

export { usuarioRoutes };