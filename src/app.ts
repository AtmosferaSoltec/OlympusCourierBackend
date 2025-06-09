import https from "https";
import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import { router } from "./routes";
import * as cron from "node-cron";
import { eliminarComprobantesSunat } from "./func/funciones";

const puerto = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Ejecuta la función todos los días a la medianoche
cron.schedule("0 0 * * *", async () => {
  eliminarComprobantesSunat();
});

if (process.env.LOCAL_MODE === "true") {
  app.listen(puerto, () => {
    console.log(`Servidor HTTP en el puerto ${puerto}`);
  });
} else {
  const certificate =
    "/etc/letsencrypt/live/atmosfera-soltec.online/fullchain.pem";
  const privateKey =
    "/etc/letsencrypt/live/atmosfera-soltec.online/privkey.pem";
  const options = {
    key: fs.readFileSync(privateKey),
    cert: fs.readFileSync(certificate),
  };

  const server = https.createServer(options, app);

  server.listen(puerto, () => {
    console.log(`Servidor HTTPS en el puerto ${puerto}`);
  });
}
