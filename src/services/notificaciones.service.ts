import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import https from 'https';
import fetch from 'node-fetch';


@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */

  EnviarNotificacion(datos: any, url: string) {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    fetch(url, {
      method: 'post',
      body: JSON.stringify(datos),
      headers: {'Content-Type': 'application/json'},
      agent: httpsAgent,
    })
  }

}


