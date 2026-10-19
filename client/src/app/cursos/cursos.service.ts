import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { URL_API } from '../auth/auth.tokens';
import { CriarCursoRequest, CursoDto } from './cursos.models';

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
}
