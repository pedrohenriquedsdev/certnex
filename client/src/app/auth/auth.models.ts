export interface CadastroRequest {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly confirmarSenha: string;
}
