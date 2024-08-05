export class User {
    constructor(
      public id: number,
      public name: string,
      public email: string,
      public password: string,
      public location: string,
      public ci_estudiante: string,
      public phone: string,
      public cod_postal: string,
      public fec_nacimiento: string,
    ) {}
  }