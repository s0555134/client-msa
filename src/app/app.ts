import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { BadgeComponent } from "./components/ui/badge/badge";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, BadgeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client-msa');
  
}
