import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.html'
})
export class DashboardAdminComponent {
  reservasActivas = 8;
  solicitudesPendientes = 5;
  reprogramacionesRecientes = 2;
  docentesActivos = 12;

  alertas = [
    { tipo: 'Reserva', descripcion: 'Duplicidad en aula B203 - Programación I', fecha: '26/10/2025' },
    { tipo: 'Solicitud', descripcion: 'Materiales pendientes - María Quispe', fecha: '25/10/2025' },
    { tipo: 'Reprogramación', descripcion: 'Cambio de clase - Juan Castro', fecha: '25/10/2025' }
  ];

  accesosRapidos = [
    { label: 'Cancelar reserva', path: '/reservas' },
    { label: 'Cancelar solicitud', path: '/solicitudes' },
    { label: 'Reprogramar clase', path: '/solicitudes/reprogramacion' },
    { label: 'Ver alumnos', path: '/alumnos' }
  ];
}
