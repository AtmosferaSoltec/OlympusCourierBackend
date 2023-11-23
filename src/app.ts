import express from "express";
import cors from "cors";
import "dotenv/config";
import { router } from './routes';

const puerto = process.env.PORT || 3000;
const app = express();
app.use(cors());


app.use(express.json())

app.use('/api', router);

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