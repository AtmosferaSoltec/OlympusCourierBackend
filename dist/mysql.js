"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'mydatabase',
};
// Función para conectar a la base de datos
async function connectToDatabase() {
    const connection = await promise_1.default.createConnection(dbConfig);
    console.log('Conectado a la base de datos MySQL');
    return connection;
}
exports.default = connectToDatabase;
