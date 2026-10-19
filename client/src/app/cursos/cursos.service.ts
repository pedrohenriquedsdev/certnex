import { Observable } from 'rxjs';

import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { URL_API } from '../auth/auth.tokens';
import {
  CertificadoDto,
  CriarCursoRequest,
  CursoDto,
  SolicitacaoCertificadosDto,
  StatusProcessamentoDto,
} from './cursos.models';

@Service()
export class CursosService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  listar(): Observable<CursoDto[]> {
    return this.http.get<CursoDto[]>(`${this.urlApi}/cursos`);
  }

  obterPorId(id: string): Observable<CursoDto> {
    return this.http.get<CursoDto>(`${this.urlApi}/cursos/${id}`);
  }

  cadastrar(request: CriarCursoRequest): Observable<CursoDto> {
    return this.http.post<CursoDto>(`${this.urlApi}/cursos`, request);
  }

  solicitarGeracaoCertificados(
    cursoId: string,
    nomesAlunos: readonly string[],
  ): Observable<SolicitacaoCertificadosDto> {
    const request = { alunos: nomesAlunos.map((nome) => ({ nome })) };

    return this.http.post<SolicitacaoCertificadosDto>(
      `${this.urlApi}/cursos/${cursoId}/certificados`,
      request,
    );
  }

  obterStatusProcessamento(cursoId: string): Observable<StatusProcessamentoDto> {
    return this.http.get<StatusProcessamentoDto>(`${this.urlApi}/cursos/${cursoId}/status`);
  }

  listarCertificados(cursoId: string): Observable<CertificadoDto[]> {
    return this.http.get<CertificadoDto[]>(`${this.urlApi}/cursos/${cursoId}/certificados`);
  }

  baixarCertificadosZip(cursoId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.urlApi}/cursos/${cursoId}/certificados/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
