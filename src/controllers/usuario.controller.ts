import {authenticate} from '@loopback/authentication/dist/decorators';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {ConfiguracionNotificaciones} from '../config/notificaciones.config';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, CredencialesRecuperarClave, FactorDeAutenticacionPorCodigo, Login, PermisosRolMenu, Usuario} from '../models';
import {CredencialesCambiarClave} from '../models/credenciales-cambiar-clave.model';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {NotificacionesService, SeguridadUsuarioService} from '../services';
import {AuthService} from '../services/auth.service';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(SeguridadUsuarioService)
    public servicioSeguridad: SeguridadUsuarioService,
    @repository(LoginRepository)
    public repositorioLogin: LoginRepository,
    @service(AuthService)
    private servicioAuth: AuthService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService
  ) { }

  @authenticate({
    strategy: "auth",
    options: ["Usuario", "guardar"]
  })
  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    // crear la clave
    let clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    // cifrar la clave
    let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    // asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    // Enviar un correo electrónico de notificación
    return this.usuarioRepository.create(usuario);
  }

  @post('/usuario-publico')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async creacionPublica(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    // crear la clave
    let clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    // cifrar la clave
    let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    // asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    //hash de validación de correo
    let hash = this.servicioSeguridad.crearTextoAleatorio(100);
    usuario.hashValidacion = hash;
    usuario.estadoValidacion = false;
    usuario.aceptado = false;

    //Notificación del hash
    let enlace = `<a href="${ConfiguracionNotificaciones.urlValidacionCorreoFrontend}/${hash}" target='_blanck'>Validar</a>`;
    let datos = {
      correoDestino: usuario.correo,
      nombreDestino: usuario.primerNombre + " " + usuario.segundoApellido,
      contenidoCorreo: `Por favor visite este link para validar su correo: ${enlace}`,
      asuntoCorreo: ConfiguracionNotificaciones.asuntoVerificacionCorreo,
    };

    let url = ConfiguracionNotificaciones.urlNotificaciones2fa;
    this.servicioNotificaciones.EnviarNotificacion(datos, url);

    // Enviar un correo electrónico de notificación
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @authenticate({
    strategy: "auth",
    options: [ConfiguracionSeguridad.menuUsuarioId, ConfiguracionSeguridad.listarAccion],

  })
  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @authenticate({
    strategy: "auth",
    options: [ConfiguracionSeguridad.menuUsuarioId, ConfiguracionSeguridad.editarAccion],

  })
  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @authenticate({
    strategy: "auth",
    options: [ConfiguracionSeguridad.menuUsuarioId, ConfiguracionSeguridad.descargarAccion],

  })
  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @authenticate({
    strategy: "auth",
    options: [ConfiguracionSeguridad.menuUsuarioId, ConfiguracionSeguridad.eliminarAccion],

  })
  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /**
   * Métodos personalizados para la API
   */

  @post('/identificar-usuario')
  @response(200, {
    description: "Identificar un usuario por correo y clave",
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}}
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales)
        }
      }
    })
    credenciales: Credenciales
  ): Promise<object> {
    let usuario = await this.servicioSeguridad.identificarUsuario(credenciales);

    if (usuario) {
      // Las credenciales son correctas, ahora proceder con la creación del código 2FA y notificación
      let codigo2fa = this.servicioSeguridad.crearTextoAleatorio(5);
      console.log(codigo2fa);

      let login: Login = new Login();
      login.usuarioId = usuario._id!;
      login.codigo2fa = codigo2fa;
      login.estadoCodigo2fa = false;
      login.token = "";
      login.estadoToken = false;
      this.repositorioLogin.create(login);

      // notificar al usuario vía correo o SMS
      let datos = {
        correoDestino: usuario.correo,
        nombreDestino: usuario.primerNombre + " " + usuario.segundoApellido,
        contenidoCorreo: `Su código de segundo factor de autenticación es: ${codigo2fa}`,
        asuntoCorreo: ConfiguracionNotificaciones.asunto2fa,
      };

      let url = ConfiguracionNotificaciones.urlNotificaciones2fa;
      this.servicioNotificaciones.EnviarNotificacion(datos, url);

      return usuario;
    }
    // Las credenciales son incorrectas
    throw new HttpErrors[401]("Credenciales Incorrectas");
  }

  @post('/recuperar-clave')
  @response(200, {
    description: "Identificar un usuario por correo y clave",
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}}
  })
  async RecuperarClaveUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(CredencialesRecuperarClave)
          }
        }
      }
    )
    credenciales: CredencialesRecuperarClave
  ): Promise<object> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo
      }
    });
    if (usuario) {
      let nuevaClave = this.servicioSeguridad.crearTextoAleatorio(5);
      console.log(nuevaClave);
      let claveCifrada = this.servicioSeguridad.cifrarTexto(nuevaClave);
      usuario.clave = claveCifrada;
      this.usuarioRepository.updateById(usuario._id, usuario);

      // notificar al usuario vía sms
      let datos = {
        numeroDestino: usuario.celular,
        contenidoMensaje: `Hola ${usuario.primerNombre}, su nueva clave es: ${nuevaClave}`,
      };
      let url = ConfiguracionNotificaciones.urlNotificacionesSms;
      this.servicioNotificaciones.EnviarNotificacion(datos, url);
      return usuario;
    }
    return new HttpErrors[401]("Credenciales incorrectas.");
  }

  @post('/cambiar-clave')
  @response(200, {
    description: "Cambiar la clave de un usuario",
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}}
  })
  async CambiarClaveUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredencialesCambiarClave)
        }
      }
    })
    credenciales: CredencialesCambiarClave
  ): Promise<object> {
    try {
      let usuario = await this.usuarioRepository.findById(credenciales.usuarioId);
      if (usuario) {
        let claveCifrada = this.servicioSeguridad.cifrarTexto(credenciales.clave);
        console.log(credenciales.clave);
        usuario.clave = claveCifrada;
        this.usuarioRepository.updateById(usuario._id, usuario);

        // notificar al usuario vía correo
        let datos = {
          correoDestino: usuario.correo,
          nombreDestino: usuario.primerNombre + " " + usuario.segundoApellido,
          contenidoCorreo: `Hola ${usuario.primerNombre}, su clave ha sido cambiada exitosamente. Su nueva clave es: ${credenciales.clave}`,
          asuntoCorreo: ConfiguracionNotificaciones.asuntoCambioClave,
        };
        let url = ConfiguracionNotificaciones.urlNotificacionesCorreo;
        await this.servicioNotificaciones.EnviarNotificacion(datos, url);

        return usuario;
      } else {
        return new HttpErrors[401]("Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      return new HttpErrors[500]("Error al enviar el correo");
    }
  }

  @post('/validar-permisos')
  @response(200, {
    description: "Validación de permisos de un usuario para lógica de negocios",
    content: {'application/json': {schema: getModelSchemaRef(PermisosRolMenu)}}
  })
  async ValidarPermisosDeUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(PermisosRolMenu)
          }
        }
      }
    )
    datos: PermisosRolMenu
  ): Promise<UserProfile | undefined> {
    let idRol = this.servicioSeguridad.obtenerRolDesdeToken(datos.token);
    return this.servicioAuth.VerificarPermisoDeUsuarioPorRol(idRol, datos.idMenu, datos.accion);
  }

  @post('/verificar-2fa')
  @response(200, {
    description: "validar un código de 2fa",
    content: {'application/json': {schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo)}}
  })
  async VerificarCodigo2fa(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo)
          }
        }
      }
    )
    credenciales: FactorDeAutenticacionPorCodigo
  ): Promise<object> {
    let usuario = await this.servicioSeguridad.validarCodigo2fa(credenciales);
    if (usuario) {
      let token = this.servicioSeguridad.crearToken(usuario);
      if (usuario) {
        usuario.clave = "";
        try {
          this.usuarioRepository.logins(usuario._id).patch(
            {
              estadoCodigo2fa: true,
              token: token
            },
            {
              estadoCodigo2fa: false
            });
        } catch {
          console.log("No se ha almacenado el cambio del estado de token en la base de datos.")
        }
        return {
          user: usuario,
          token: token
        };
      }
    }
    throw new HttpErrors.UnprocessableEntity("Código de 2fa inválido para el usuario definido");  }

}
