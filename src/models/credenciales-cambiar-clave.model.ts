import {Model, model, property} from '@loopback/repository';

@model()
export class CredencialesCambiarClave extends Model {
  @property({
    type: 'string',
    required: true,
  })
  usuarioId: string;

  @property({
    type: 'string',
    required: true,
  })
  clave: string;


  constructor(data?: Partial<CredencialesCambiarClave>) {
    super(data);
  }
}

export interface CredencialesCambiarClaveRelations {
  // describe navigational properties here
}

export type CredencialesCambiarClaveWithRelations = CredencialesCambiarClave & CredencialesCambiarClaveRelations;
