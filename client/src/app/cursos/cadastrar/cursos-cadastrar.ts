import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';

interface CursoFormModel {
  readonly nome: string;
  readonly cargaHoraria: string;
  readonly dataConclusao: string;
}

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-cursos-cadastrar',
  templateUrl: './cursos-cadastrar.html',
})
export class CursosCadastrar {
  protected readonly modeloCurso = signal<CursoFormModel>({
    nome: '',
    cargaHoraria: '',
    dataConclusao: '',
  });

  protected readonly formularioCurso = form(this.modeloCurso, (modelo) => {
    required(modelo.nome, { message: 'Informe o nome do curso.' });
    required(modelo.cargaHoraria, { message: 'Informe a carga horária.' });
    required(modelo.dataConclusao, { message: 'Informe a data de conclusão.' });
  });

  protected enviarFormulario(event: SubmitEvent): void {
    event.preventDefault();

    if (this.formularioCurso().invalid()) {
      this.formularioCurso().markAsTouched();
      return;
    }

    // Formulário ainda não conectado à API (próximo passo: POST /cursos).
  }
}
