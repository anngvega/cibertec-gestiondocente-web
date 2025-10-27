import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cibertec-gestiondocente-web');
  private auth = inject(AuthService);

  constructor() {
    this.auth.resumeSession();
  }
}
