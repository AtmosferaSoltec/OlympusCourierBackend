"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const distrito_routes_1 = require("./routes/distrito.routes");
const cliente_routes_1 = require("./routes/cliente.routes");
const usuarios_routes_1 = require("./routes/usuarios.routes");
const tipo_paquetes_routes_1 = require("./routes/tipo_paquetes.routes");
const repartos_routes_1 = require("./routes/repartos.routes");
const comprobantes_routes_1 = require("./routes/comprobantes.routes");
const consultas_routes_1 = require("./routes/consultas.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const ip = process.env.IP || 0;
const puerto = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', distrito_routes_1.distritoRoutes);
app.use('/api', cliente_routes_1.clienteRoutes);
app.use('/api', usuarios_routes_1.usuarioRoutes);
app.use('/api', tipo_paquetes_routes_1.tipoPaquetesRoutes);
app.use('/api', repartos_routes_1.repartoRoutes);
app.use('/api', comprobantes_routes_1.comprobantesRoutes);
app.use('/api', consultas_routes_1.consultasRoutes);
async function startServer() {
    try {
        //await db();
        console.log('Conexión a la base de datos exitosa');
        app.listen(puerto, () => {
            console.log(`Servidor Express escuchando en http://${ip}:${puerto}`);
        });
    }
    catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}
startServer();
