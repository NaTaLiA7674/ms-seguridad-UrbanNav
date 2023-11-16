export namespace ConfiguracionSeguridad {
  export const claveJWT = process.env.SECRET_PASSWORD_JWT;
  export const menuUsuarioId = "65248500b7b4ea4d182c8fc0";
  export const listarAccion = "listar";
  export const guardarAccion = "guardar";
  export const editarAccion = "editar";
  export const eliminarAccion = "eliminar";
  export const descargarAccion = "descargar";
  export const mongodbConnectionString = process.env.CONNECTION_STRING_MONGODB;
  export const rolPasajero = "65248419b7b4ea4d182c8fbe";
  export const rolConductor = "65248429b7b4ea4d182c8fbf";
}
