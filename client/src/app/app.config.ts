import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { URL_API } from './auth/auth.tokens';
import { environment } from '../environments/environment';

// ApplicationConfig substitui o antigo AppModule: é aqui que ficam registrados
// os serviços/recursos "globais" que qualquer parte do app pode pedir via
// injeção de dependência (inject()), sem precisar saber como foram montados.
export const appConfig: ApplicationConfig = {
  providers: [
    // Captura erros não tratados do navegador (ex.: exceções fora do Angular)
    // e os reporta via ErrorHandler, em vez de só estourar no console.
    provideBrowserGlobalErrorListeners(),
    // Ativa o Router com o mapa de rotas definido em app.routes.ts.
    provideRouter(routes),
    // Ativa o HttpClient (usado pelo AuthService para chamar a API).
    provideHttpClient(),
    {
      // Registra o valor concreto para o InjectionToken URL_API (definido em
      // auth.tokens.ts). Quem pedir `inject(URL_API)` recebe environment.urlApi.
      // Isso é o que permite trocar a URL da API entre dev/produção sem tocar
      // no código do AuthService — só o arquivo de environment muda.
      provide: URL_API,
      useValue: environment.urlApi
    },
  ]
};
