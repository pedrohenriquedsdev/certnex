import { HttpErrorResponse } from '@angular/common/http';
import { ApiValidationProblems } from './auth.models';

export function obterMensagemErro(erro: HttpErrorResponse, mensagemPadrao: string): string {
  if (erro.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  if (erro.status === 401) {
    return 'E-mail ou senha incorretos.';
  }

  if (erro.status === 409) {
    return 'Este e-mail já está cadastrado. Entre na sua conta ou use outro e-mail.';
  }

  if (erro.status >= 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  const problema = erro.error as ApiValidationProblems | undefined;

  // Erros de validação (400) vêm em `errors`, um array de mensagens por campo;
  // achata tudo numa frase só em vez de mostrar campo por campo.
  if (problema?.errors) {
    return Object.values(problema.errors).flat().join(' ');
  }

  return problema?.detail ?? mensagemPadrao;
}
