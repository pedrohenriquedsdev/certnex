import { HttpErrorResponse } from '@angular/common/http';

export function obterMensagemErro(erro: HttpErrorResponse, mensagemPadrao: string): string {
  if (erro.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  if (erro.status >= 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  return erro.error?.detail ?? mensagemPadrao;
}
