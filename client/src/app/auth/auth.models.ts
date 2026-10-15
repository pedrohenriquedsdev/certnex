export interface CadastroRequest {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly confirmarSenha: string;
}

export interface UsuarioDto {
  readonly id: string;
  readonly email: string;
}

export interface CadastroConcluidoNavigationState {
  readonly emailCadastrado?: string;
}
