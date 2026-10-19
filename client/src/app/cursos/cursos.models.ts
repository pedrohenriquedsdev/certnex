export interface CursoDto {
  readonly id: string;
  readonly nome: string;
  readonly cargaHoraria: number;
  readonly dataConclusao: string;
}

export interface CriarCursoRequest {
  readonly nome: string;
  readonly cargaHoraria: number;
  readonly dataConclusao: string;
}

export type StatusProcessamento = 'Pendente' | 'GerandoCertificados' | 'Concluido' | 'ConcluidoComFalhas';
export type StatusGeracao = 'Pendente' | 'Gerado' | 'Falha';

export interface SolicitacaoCertificadosDto {
  readonly cursoId: string;
  readonly totalAlunos: number;
  readonly status: StatusProcessamento;
}

export interface StatusProcessamentoDto {
  readonly cursoId: string;
  readonly status: StatusProcessamento;
  readonly totalCertificados: number;
  readonly gerados: number;
  readonly falhas: number;
  readonly zipDisponivel: boolean;
  readonly iniciadoEm: string;
  readonly concluidoEm: string | null;
}

export interface CertificadoDto {
  readonly id: string;
  readonly nomeAluno: string;
  readonly statusGeracao: StatusGeracao;
  readonly geradoEm: string | null;
}
