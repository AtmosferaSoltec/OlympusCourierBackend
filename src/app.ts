import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { distritoRoutes } from './routes/distrito.routes';
import { clienteRoutes } from './routes/cliente.routes';
import { usuarioRoutes } from './routes/usuarios.routes';
import { tipoPaquetesRoutes } from './routes/tipo_paquetes.routes';
import { repartoRoutes } from './routes/repartos.routes';
import { comprobantesRoutes } from './routes/comprobantes.routes';
import { consultasRoutes } from './routes/consultas.routes';

dotenv.config()

const app = express();

const puerto = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

app.use('/api', distritoRoutes);
app.use('/api', clienteRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', tipoPaquetesRoutes);
app.use('/api', repartoRoutes);
app.use('/api', comprobantesRoutes);
app.use('/api', consultasRoutes);

async function startServer() {
    try {
        app.listen(puerto, () => {
            console.log(`Servidor Express escuchando en el puerto ${puerto}`);
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

startServer();