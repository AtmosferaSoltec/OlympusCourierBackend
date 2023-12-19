import { Request, Response } from "express";
import { Router } from 'express';
import clienteControllers from '../controllers/cliente.controllers';
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.get('/', checkAuth as any, clienteControllers.getAllClientes as any);
router.get('/:id', checkAuth as any, clienteControllers.getCliente as any);
router.get('/search/:datos', checkAuth as any, clienteControllers.searchCliente as any)
router.post('/', checkAuth as any, clienteControllers.insertCliente as any);
router.put('/:id', checkAuth as any, clienteControllers.updateCliente as any);
router.patch('/:id', checkAuth as any, clienteControllers.setActivoCliente as any);

export { router };