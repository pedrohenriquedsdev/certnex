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
  {
    // https://site.com/cursos/... — CursosShell é só o "molde" (navbar + menu);
    // quem decide o que aparece dentro dele são as rotas filhas (children).
    path: 'cursos',
    loadComponent: () => import('./cursos/shell/cursos-shell').then((m) => m.CursosShell),
    children: [
      // path: '' = https://site.com/cursos (sem nada depois). pathMatch: 'full'
      // garante que só redireciona quando a URL termina exatamente aqui —
      // sem isso, '' combinaria com qualquer sub-caminho e nunca deixaria
      // 'listar'/'cadastrar' serem alcançados.
      { path: '', pathMatch: 'full', redirectTo: 'listar' },
      {
        // https://site.com/cursos/listar
        path: 'listar',
        loadComponent: () => import('./cursos/listar/cursos-listar').then((m) => m.CursosListar),
      },
      {
        // https://site.com/cursos/cadastrar
        path: 'cadastrar',
        loadComponent: () =>
          import('./cursos/cadastrar/cursos-cadastrar').then((m) => m.CursosCadastrar),
      },
      {
        // :id é um parâmetro de rota — https://site.com/cursos/detalhes/<qualquer-guid>
        // cai aqui, e o componente lê o valor via ActivatedRoute.
        path: 'detalhes/:id',
        loadComponent: () =>
          import('./cursos/detalhes/cursos-detalhes').then((m) => m.CursosDetalhes),
      },
    ],
  },
];
