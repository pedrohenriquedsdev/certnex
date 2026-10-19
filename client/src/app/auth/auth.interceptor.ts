import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

// Requisições HTTP são imutáveis: não dá pra adicionar um header na requisição
// original, por isso o clone() antes de seguir pra próxima etapa (next).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.sessao()?.token.accessToken;

  if (!accessToken) {
    return next(req);
  }

  const requisicaoAutenticada = req.clone({
    setHeaders: { Authorization: `Bearer ${accessToken}` },
  });

  return next(requisicaoAutenticada);
};
