import { Component } from '@angular/core';
import { PaginaAutenticacao } from '../pagina-autenticacao';
import { RouterLink } from '@angular/router';

@Component({
  imports: [PaginaAutenticacao, RouterLink],
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
})
export class Cadastro {}
