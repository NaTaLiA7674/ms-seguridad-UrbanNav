export namespace ConfiguracionNotificaciones {
  export const asunto2fa: string = "Código de verificación";
  export const asuntoVerificacionCorreo: string = "Verificación de correo";
  export const asuntoCambioClave: string = "Cambio de contraseña";
  export const urlNotificacionesCorreo: string = "https://localhost:7278/Notificaciones/enviar-correo-cambio-clave";
  export const urlNotificaciones2fa: string = "https://localhost:7278/Notificaciones/enviar-correo-2fa";
  export const urlNotificacionesSms: string = "https://localhost:7278/Notificaciones/enviar-sms";
  export const urlValidacionCorreoFrontend: string = "http://localhost:4200/validar-hash-usuario-publico";
}
