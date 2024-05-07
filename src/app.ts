import https from 'https';
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import fs from 'fs';
import { router } from './routes';
import * as cron from 'node-cron';
import { eliminarComprobantesSunat } from './func/funciones';

const puerto = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json())
app.use('/api', router);

app.get('/ping', (req, res)=>{
    res.send("Pong")
})


app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Ejecuta la función todos los días a la medianoche
cron.schedule('0 0 * * *', async () => {
    eliminarComprobantesSunat();
});



/*
 * 
app.listen(puerto, () => {
    console.log(`Servidor HTTPS en el puerto ${puerto}`);
});
 */


const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/sv-yaaugkfbpu.cloud.elastika.pe/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/sv-yaaugkfbpu.cloud.elastika.pe/fullchain.pem'),
};

const server = https.createServer(options, app);

server.listen(puerto, () => {
    console.log(`Servidor HTTPS en el puerto ${puerto}`);
});