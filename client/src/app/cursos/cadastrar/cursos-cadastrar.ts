import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, FormRoot, maxLength, min, required } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { obterMensagemErro } from '../../auth/auth-erros';
import { CriarCursoRequest } from '../cursos.models';
import { CursosService } from '../cursos.service';

interface CursoFormModel {
  readonly nome: string;
  readonly cargaHoraria: number | null;
  readonly dataConclusao: string;
}

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-cursos-cadastrar',
  templateUrl: './cursos-cadastrar.html',
})
export class CursosCadastrar {
  private readonly cursosService = inject(CursosService);
  private readonly router = inject(Router);

  protected readonly erroCadastro = signal<string | null>(null);
  protected readonly enviandoFormulario = signal(false);

  protected readonly modeloCurso = signal<CursoFormModel>({
    nome: '',
    cargaHoraria: null,
    dataConclusao: '',
  });

  protected readonly formularioCurso = form(this.modeloCurso, (modelo) => {
    required(modelo.nome, { message: 'Informe o nome do curso.' });
    maxLength(modelo.nome, 200, { message: 'O nome deve ter no máximo 200 caracteres.' });

    required(modelo.cargaHoraria, { message: 'Informe a carga horária.' });
    min(modelo.cargaHoraria, 1, { message: 'A carga horária deve ser maior que zero.' });

    required(modelo.dataConclusao, { message: 'Informe a data de conclusão.' });
  });

  protected enviarFormulario(event: SubmitEvent): void {
    event.preventDefault();

    this.erroCadastro.set(null);

    if (this.formularioCurso().invalid()) {
      this.formularioCurso().markAsTouched();
      return;
    }

    const modelo = this.modeloCurso();

    const request: CriarCursoRequest = {
      // trim() normaliza espaços no início/fim — já mordeu um dev nesse
      // projeto antes (ver cadastro de usuário), então repetimos aqui.
      nome: modelo.nome.trim(),
      cargaHoraria: modelo.cargaHoraria!,
      dataConclusao: modelo.dataConclusao,
    };

    this.enviandoFormulario.set(true);

    this.cursosService.cadastrar(request).subscribe({
      next: () => {
        void this.router.navigateByUrl('/cursos/listar');
      },
      error: (erro: HttpErrorResponse) => {
        this.enviandoFormulario.set(false);
        this.erroCadastro.set(obterMensagemErro(erro, 'Não foi possível cadastrar o curso.'));
      },
    });
  }
}
