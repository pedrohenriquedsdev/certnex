import { Observable, tap } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  CadastroRequest,
  LoginRequest,
  SessaoAutenticada,
  TokenDto,
  UsuarioDto,
} from './auth.models';
import { CHAVE_ARMAZENAMENTO_SESSAO, URL_API } from './auth.tokens';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly urlApi = inject(URL_API);
  private readonly chaveArmazenamento = inject(CHAVE_ARMAZENAMENTO_SESSAO);

  // Inicializa o signal já lendo do localStorage: se havia uma sessão válida
  // salva de uma visita anterior, o usuário continua logado após recarregar.
  private readonly sessaoState = signal<SessaoAutenticada | null>(this.lerSessao());
  readonly sessao = this.sessaoState.asReadonly();

  cadastrar(req: CadastroRequest): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(`${this.urlApi}/auth/cadastro`, req);
  }

  login(req: LoginRequest): Observable<TokenDto> {
    return this.http
      .post<TokenDto>(`${this.urlApi}/auth/login`, req)
      .pipe(tap((token) => this.salvarSessao(token, req.email))); // tap é utilizado para gerar efeitos colaterais
  }

  encerrarSessao(): void {
    this.sessaoState.set(null);
    this.removerSessaoArmazenada();

    void this.router.navigateByUrl('/login');
  }

  private salvarSessao(token: TokenDto, email: string): void {
    const usuario: UsuarioDto = { id: token.usuarioId, email: email };

    const sessao: SessaoAutenticada = {
      token,
      usuario,
    };

    this.sessaoState.set(sessao);

    try {
      localStorage.setItem(this.chaveArmazenamento, JSON.stringify(sessao));
    } catch {
      // Sem acesso ao localStorage (ex.: navegação privada); a sessão
      // continua válida em memória, só não sobrevive a um reload.
    }
  }

  private removerSessaoArmazenada(): void {
    try {
      localStorage.removeItem(this.chaveArmazenamento);
    } catch {
      // Sem localStorage, não há nada para remover.
    }
  }

  private lerSessao(): SessaoAutenticada | null {
    try {
      const bruto = localStorage.getItem(this.chaveArmazenamento);

      if (!bruto) {
        return null;
      }

      const sessao = JSON.parse(bruto) as SessaoAutenticada;

      if (!sessao?.token?.accessToken || !sessao?.usuario) {
        this.removerSessaoArmazenada();
        return null;
      }

      const dataExpiracao = new Date(sessao.token.dataExpiracaoEmUtc).getTime();

      // Date.getTime() devolve NaN para datas inválidas; e uma sessão cujo
      // token já expirou não deve ser reaproveitada.
      if (Number.isNaN(dataExpiracao) || dataExpiracao <= Date.now()) {
        this.removerSessaoArmazenada();
        return null;
      }

      return sessao;
    } catch {
      // JSON corrompido ou localStorage indisponível: trata como "sem sessão".
      return null;
    }
  }
}
