import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Reserva } from '../../models/reserva.model';

@Component({
  standalone: true,
  selector: 'app-reserva',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './reserva.html'
})
export class ReservaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  horasDisponibles = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 - 22:00
  aulasDisponibles = signal<any[]>([]);
  reservas = signal<Reserva[]>([]);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    idAula: [null, Validators.required],
    idCurso: [1],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required]
  });

  ngOnInit() {
    this.listar();
  }

  cargarAulasDisponibles() {
    const v = this.form.value;
    if (!v.fecha || !v.horaInicio || !v.horaFin) return;

    if (Number(v.horaFin) <= Number(v.horaInicio)) {
      this.error.set('La hora de fin debe ser mayor que la de inicio');
      return;
    }

    const horaInicio = v.horaInicio!.toString().padStart(2, '0');
    const horaFin = v.horaFin!.toString().padStart(2, '0');
    const inicio = `${v.fecha}T${horaInicio}:00:00`;
    const fin = `${v.fecha}T${horaFin}:00:00`;

    this.http.get<any[]>(`${environment.apiUrl}/api/aulas/disponibles`, {
      params: { inicio, fin }
    }).subscribe({
      next: data => {
        this.aulasDisponibles.set(data || []);
        this.error.set('');
      },
      error: err => {
        console.error('Error al listar aulas disponibles', err);
        this.aulasDisponibles.set([]);
        this.error.set('Error al listar aulas disponibles');
      }
    });
  }

  crear() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;

    if (Number(v.horaFin) <= Number(v.horaInicio)) {
      this.error.set('La hora de fin debe ser mayor que la de inicio');
      return;
    }

    const horaInicio = v.horaInicio!.toString().padStart(2, '0');
    const horaFin = v.horaFin!.toString().padStart(2, '0');
    const inicio = `${v.fecha}T${horaInicio}:00:00`;
    const fin = `${v.fecha}T${horaFin}:00:00`;

    const body = {
      idAula: v.idAula!,
      idCurso: v.idCurso ?? 1,
      idDocente: 1, // temporal
      inicio,
      fin
    };

    this.loading.set(true);
    this.error.set('');

    this.http.post(`${environment.apiUrl}/api/reservas`, body).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        this.aulasDisponibles.set([]);
        this.error.set('');
        this.listar();
      },
      error: err => {
        this.loading.set(false);
        console.error('Error al crear reserva', err);
        this.error.set(err?.error?.message || 'No se pudo crear la reserva');
      }
    });
  }

  listar() {
    this.loading.set(true);
    this.http.get<Reserva[]>(`${environment.apiUrl}/api/reservas/lista`).subscribe({
      next: data => {
        this.loading.set(false);
        this.reservas.set(data || []);
        this.error.set('');
      },
      error: err => {
        this.loading.set(false);
        console.error('Error al listar reservas', err);
        this.error.set('No se pudieron obtener las reservas');
      }
    });
  }

  cancelar(id: number) {
    if (!confirm('¿Cancelar la reserva?')) return;

    this.http.delete(`${environment.apiUrl}/api/reservas/${id}`).subscribe({
      next: () => this.listar(),
      error: err => alert(err?.error?.message || 'No se pudo cancelar la reserva')
    });
  }
}
