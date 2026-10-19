import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

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

  return next(requisicaoAutenticada).pipe(
    catchError((erro: unknown) => {
      // Só chega aqui quando a requisição JÁ tinha um token anexado — ou
      // seja, um 401 aqui é sessão expirada/inválida, não "senha errada" no
      // login (aquela chamada nem passa pelo clone acima, pois ainda não há
      // token). Desloga e deixa o componente que chamou mostrar o erro.
      if (erro instanceof HttpErrorResponse && erro.status === 401) {
        authService.encerrarSessao();
      }

      return throwError(() => erro);
    }),
  );
};
