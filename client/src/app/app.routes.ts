import { Routes } from '@angular/router';

// Routes = lista de "URL -> o que mostrar". O Router lê isso para decidir
// o que renderizar dentro do <router-outlet> de app.html.
export const routes: Routes = [
  {
    // path: '' é a home (ex.: https://site.com/)
    path: '',
    // loadComponent + import() dinâmico = lazy loading: o código de Home só é
    // baixado pelo navegador quando o usuário navega para esta rota, não no
    // carregamento inicial do app. m é o módulo JS importado; m.Home é a classe
    // do componente exportada por home.ts.
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    // https://site.com/cadastro
    path: 'cadastro',
    loadComponent: () => import('./auth/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    // https://site.com/login
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
];
