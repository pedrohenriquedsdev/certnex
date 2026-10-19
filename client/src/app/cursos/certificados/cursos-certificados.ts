import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';

import { obterMensagemErro } from '../../auth/auth-erros';
import { CertificadoDto, StatusProcessamentoDto } from '../cursos.models';
import { CursosService } from '../cursos.service';

const INTERVALO_POLLING_MS = 3000;

@Component({
  imports: [RouterLink],
  selector: 'app-cursos-certificados',
  templateUrl: './cursos-certificados.html',
})
export class CursosCertificados {
  private readonly cursosService = inject(CursosService);
  private readonly rotaAtiva = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly cursoId: string | null;
  private pollingSubscription: Subscription | null = null;

  private readonly alunosTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('alunosTextarea');

  protected readonly carregando = signal(true);
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal<string | null>(null);

  protected readonly status = signal<StatusProcessamentoDto | null>(null);
  protected readonly certificados = signal<CertificadoDto[]>([]);

  constructor() {
    this.cursoId = this.rotaAtiva.snapshot.paramMap.get('id');

    if (!this.cursoId) {
      this.mensagemErro.set('Identificador do curso inválido.');
      this.carregando.set(false);
      return;
    }

    this.consultarStatusInicial(this.cursoId);
  }

  private consultarStatusInicial(cursoId: string): void {
    this.cursosService.obterStatusProcessamento(cursoId).subscribe({
      next: (status) => {
        this.status.set(status);
        this.carregando.set(false);
        this.carregarCertificados(cursoId);
        this.iniciarPollingSeNecessario(cursoId);
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando.set(false);

        // 404 aqui só quer dizer "nenhum lote gerado ainda" — é o estado
        // inicial normal, não um erro de verdade. O template mostra o
        // formulário quando status() é null.
        if (erro.status !== 404) {
          this.mensagemErro.set(obterMensagemErro(erro, 'Não foi possível consultar o status.'));
        }
      },
    });
  }

  private carregarCertificados(cursoId: string): void {
    this.cursosService.listarCertificados(cursoId).subscribe({
      next: (certificados) => this.certificados.set(certificados),
    });
  }

  private iniciarPollingSeNecessario(cursoId: string): void {
    const statusAtual = this.status()?.status;

    if (statusAtual !== 'Pendente' && statusAtual !== 'GerandoCertificados') {
      return;
    }

    this.pollingSubscription?.unsubscribe();

    this.pollingSubscription = interval(INTERVALO_POLLING_MS)
      .pipe(
        switchMap(() => this.cursosService.obterStatusProcessamento(cursoId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (status) => {
          this.status.set(status);
          this.carregarCertificados(cursoId);

          if (status.status === 'Concluido' || status.status === 'ConcluidoComFalhas') {
            this.pollingSubscription?.unsubscribe();
          }
        },
        error: () => this.pollingSubscription?.unsubscribe(),
      });
  }

  protected solicitarGeracao(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.cursoId) {
      return;
    }

    const texto = this.alunosTextarea()?.nativeElement.value ?? '';

    const alunos = texto
      .split('\n')
      .map((nome) => nome.trim())
      .filter((nome) => nome.length > 0);

    if (alunos.length === 0) {
      this.mensagemErro.set('Informe ao menos um aluno.');
      return;
    }

    this.mensagemErro.set(null);
    this.enviandoFormulario.set(true);

    this.cursosService.solicitarGeracaoCertificados(this.cursoId, alunos).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        this.consultarStatusInicial(this.cursoId!);
      },
      error: (erro: HttpErrorResponse) => {
        this.enviandoFormulario.set(false);
        this.mensagemErro.set(obterMensagemErro(erro, 'Não foi possível solicitar a geração.'));
      },
    });
  }

  protected baixarZip(): void {
    if (!this.cursoId) {
      return;
    }

    this.cursosService.baixarCertificadosZip(this.cursoId).subscribe({
      next: (resposta) => {
        const blob = resposta.body;

        if (!blob) {
          return;
        }

        const nomeArquivo =
          this.extrairNomeArquivo(resposta.headers.get('content-disposition')) ?? 'certificados.zip';

        // Baixar um Blob não precisa de backend extra: cria uma URL temporária
        // em memória, "clica" num link invisível e libera a URL depois.
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = nomeArquivo;
        link.click();

        URL.revokeObjectURL(url);
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagemErro.set(obterMensagemErro(erro, 'Não foi possível baixar o arquivo.'));
      },
    });
  }

  private extrairNomeArquivo(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const correspondencia = /filename="?([^";]+)"?/.exec(contentDisposition);

    return correspondencia?.[1] ?? null;
  }
}
