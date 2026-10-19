import { InjectionToken } from "@angular/core";

export const URL_API = new InjectionToken<string>('URL_API')

// Nome da chave usada no localStorage para persistir a sessão autenticada.
export const CHAVE_ARMAZENAMENTO_SESSAO = new InjectionToken<string>('CHAVE_ARMAZENAMENTO_SESSAO')
