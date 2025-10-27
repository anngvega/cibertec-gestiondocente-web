import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DatePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [DatePipe, NgForOf, NgIf],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  notasHoy = 0;
  reservas: any[] = [];

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/api/stats/docente`)
      .subscribe({
        next: (res) => {
          this.notasHoy = res?.notasHoy ?? 0;
          this.reservas = res?.proximasReservas ?? [];
        },
        error: () => {
          this.notasHoy = 0;
          this.reservas = [];
        }
      });
  }
}
