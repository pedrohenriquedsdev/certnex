import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  imports: [RouterLink, Navbar],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
