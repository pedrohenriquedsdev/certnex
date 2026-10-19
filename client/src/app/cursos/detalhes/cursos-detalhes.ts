import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { obterMensagemErro } from '../../auth/auth-erros';
import { CursoDto } from '../cursos.models';
import { CursosService } from '../cursos.service';

@Component({
  selector: 'app-cursos-detalhes',
  templateUrl: './cursos-detalhes.html',
})
export class CursosDetalhes {
  private readonly cursosService = inject(CursosService);
  private readonly rotaAtiva = inject(ActivatedRoute);

  protected readonly curso = signal<CursoDto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal<string | null>(null);

  constructor() {
    const id = this.rotaAtiva.snapshot.paramMap.get('id');

    if (!id) {
      this.mensagemErro.set('Identificador do curso inválido.');
      this.carregando.set(false);
      return;
    }

    this.cursosService.obterPorId(id).subscribe({
      next: (curso) => {
        this.curso.set(curso);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagemErro.set(obterMensagemErro(erro, 'Não foi possível carregar o curso.'));
        this.carregando.set(false);
      },
    });
  }

  protected formatarData(data: string): string {
    // new Date('2026-12-31') é interpretado como meia-noite UTC; convertido
    // de volta pro fuso local (ex.: UTC-3) ele "volta" pro dia 30. Montar a
    // data a partir dos componentes ano/mês/dia evita esse deslocamento.
    const [ano, mes, dia] = data.split('-').map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }
}
