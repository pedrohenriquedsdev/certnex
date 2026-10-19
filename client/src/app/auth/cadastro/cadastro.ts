import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { PaginaAutenticacao } from '../pagina-autenticacao';
import { Router, RouterLink } from '@angular/router';
import { CadastroConcluidoNavigationState, CadastroRequest } from '../auth.models';
import { AuthService } from '../auth.service';
import { obterMensagemErro } from '../auth-erros';

interface CadastroFormModel {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly confirmarSenha: string;
}

@Component({
  imports: [FormField, FormRoot, PaginaAutenticacao, RouterLink],
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly tituloPagina = viewChild<ElementRef<HTMLHeadingElement>>('tituloPagina');

  protected readonly erroCadastro = signal<string | null>(null);
  protected readonly enviandoFormulario = signal(false);

  protected readonly modeloFormulario = signal<CadastroFormModel>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  protected readonly formularioCadastro = form(this.modeloFormulario, (modelo) => {
    required(modelo.nome, { message: 'Informe seu nome.' });
    minLength(modelo.nome, 3, { message: 'O nome precisa ter pelo menos 3 caracteres.' });

    required(modelo.email, { message: 'Informe seu email.' });
    email(modelo.email, { message: 'Informe um email válido.' });

    required(modelo.senha, { message: 'Informe sua senha.' });
    minLength(modelo.senha, 8, { message: 'A senha precisa ter pelo menos 8 caracteres.' });
    pattern(modelo.senha, /(?=.*\d)(?=.*[^a-zA-Z0-9]).+/, {
      message: 'Inclua pelo menos um número e um caractere especial.',
    });

    required(modelo.confirmarSenha, { message: 'Confirme sua senha.' });
    validate(modelo.confirmarSenha, (ctx) => {
      if (ctx.value() !== ctx.valueOf(modelo.senha)) {
        return { kind: 'senhasDiferentes', message: 'As senhas precisam ser iguais.' };
      }

      return null;
    });
  });

  constructor() {
    // Alterado para afterNextRender respeitando o ciclo de vida dos componentes
    afterNextRender(() => this.tituloPagina()?.nativeElement.focus());
  }

  protected enviarFormulario(event: SubmitEvent): void {
    event.preventDefault();

    this.erroCadastro.set(null);

    // Metadados de validação
    if (this.formularioCadastro().invalid()) {
      this.formularioCadastro().markAsTouched();
      console.log(this.formularioCadastro().errorSummary());
      return;
    }

    const request: CadastroRequest = {
      nome: this.modeloFormulario().nome.trim(),
      email: this.modeloFormulario().email.trim(),
      senha: this.modeloFormulario().senha,
      confirmarSenha: this.modeloFormulario().confirmarSenha
    };

    this.enviandoFormulario.set(true);

    // Enviar o forms -> Acessar a API -> Passar a request -> Pegar o retorno
    this.authService.cadastrar(request).subscribe({
      next: (usuario) => {
        const estadoNavegacao: CadastroConcluidoNavigationState = {
          emailCadastrado: usuario.email
        };

        void this.router.navigateByUrl('/login', { state: estadoNavegacao });
      },
      error: (erro: HttpErrorResponse) => {
        this.enviandoFormulario.set(false);
        this.erroCadastro.set(obterMensagemErro(erro, 'Não foi possível concluir o cadastro.'));
      },
    });
  }
}
