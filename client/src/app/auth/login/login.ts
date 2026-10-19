import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { CadastroConcluidoNavigationState, LoginRequest } from '../auth.models';
import { PaginaAutenticacao } from '../pagina-autenticacao';
import { AuthService } from '../auth.service';
import { obterMensagemErro } from '../auth-erros';

interface LoginFormModel {
  readonly email: string;
  readonly senha: string;
}

@Component({
  imports: [FormField, FormRoot, PaginaAutenticacao, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly tituloPagina = viewChild<ElementRef<HTMLHeadingElement>>('tituloPagina');

  protected readonly erroLogin = signal<string | null>(null);
  protected readonly mensagemSucesso = signal<string | null>(null);
  protected readonly enviandoFormulario = signal(false);

  protected readonly modeloLogin = signal<LoginFormModel>({ email: '', senha: '' });
  protected readonly formularioLogin = form(this.modeloLogin, (modelo) => {
      required(modelo.email, { message: 'Informe seu email.' });
      email(modelo.email, { message: 'Informe um email válido.' });
      required(modelo.senha, { message: 'Informe sua senha.' });
      minLength(modelo.senha, 8, { message: 'A senha precisa ter pelo menos 8 caracteres.' });
    });

  constructor() {
    afterNextRender(() => this.tituloPagina()?.nativeElement.focus());

    const estadoNavegacao = this.router.currentNavigation()?.extras.state as
      CadastroConcluidoNavigationState | undefined;

    if (estadoNavegacao?.emailCadastrado) {
      this.modeloLogin.update((original) => ({
        email: estadoNavegacao?.emailCadastrado ?? '',
        senha: original.senha,
      }));

      this.mensagemSucesso.set('Conta criada com sucesso! Entre com seu e-mail e senha.');
    }
  }

  protected enviarFormulario(event: SubmitEvent): void {
      event.preventDefault();

      this.erroLogin.set(null);

      const formulario = this.formularioLogin();

      if (formulario.invalid()) {
        formulario.markAsTouched();
        return;
      }

      const modelo = this.modeloLogin();

    const requisicao: LoginRequest = {
      email: modelo.email.trim(),
      senha: modelo.senha,
    };

    this.enviandoFormulario.set(true);

    this.authService.login(requisicao).subscribe({
      next: () => {
        void this.router.navigateByUrl('/');
      },
      error: (erro: HttpErrorResponse) => {
        this.enviandoFormulario.set(false);
        this.erroLogin.set(obterMensagemErro(erro, 'Não foi possível entrar. Tente novamente.'));
      },
    });
    }
}
