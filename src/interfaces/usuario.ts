export interface Usuario {
    id: number;
    id_ruc: number;
    documento: string;
    nombres: string;
    ape_paterno: string;
    ape_materno: string;
    telefono: string;
    correo: string;
    fecha_nac: Date;
    clave: string;
    cod_rol: string;
    activo: string;
}