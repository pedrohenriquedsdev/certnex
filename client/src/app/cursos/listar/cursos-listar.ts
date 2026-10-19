import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { obterMensagemErro } from '../../auth/auth-erros';
import { CursoDto } from '../cursos.models';
import { CursosService } from '../cursos.service';

@Component({
  imports: [RouterLink],
  selector: 'app-cursos-listar',
  templateUrl: './cursos-listar.html',
})
export class CursosListar {
  private readonly cursosService = inject(CursosService);

  protected readonly cursos = signal<CursoDto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal<string | null>(null);

  constructor() {
    this.carregarCursos();
  }

  private carregarCursos(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.cursosService.listar().subscribe({
      next: (cursos) => {
        this.cursos.set(cursos);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagemErro.set(obterMensagemErro(erro, 'Não foi possível carregar os cursos.'));
        this.carregando.set(false);
      },
    });
  }
}
