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

export interface LoginRequest {
  readonly email: string;
  readonly senha: string;
}

export interface TokenDto {
  readonly usuarioId: string;
  readonly accessToken: string;
  readonly dataExpiracaoEmUtc: string;
}

export interface SessaoAutenticada {
  readonly token: TokenDto;
  readonly usuario: UsuarioDto;
}

// Formato do corpo de erro que a API devolve (RFC 7807 / ProblemDetails).
// `errors` só vem preenchido em erros de validação (400).
export interface ApiValidationProblems {
  readonly detail?: string;
  readonly errors?: Record<string, string[]>;
}
