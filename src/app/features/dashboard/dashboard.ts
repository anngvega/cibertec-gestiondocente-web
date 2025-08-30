import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <p class="text-gray-600">Bienvenido al sistema RRHH. Selecciona una opción en el menú lateral.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="p-4 rounded-lg bg-white border border-gray-200">
          <div class="text-sm text-gray-500">Ejemplo</div>
          <div class="mt-1 text-2xl font-semibold">123</div>
        </div>
        <div class="p-4 rounded-lg bg-white border border-gray-200">
          <div class="text-sm text-gray-500">Ejemplo</div>
          <div class="mt-1 text-2xl font-semibold">456</div>
        </div>
        <div class="p-4 rounded-lg bg-white border border-gray-200">
          <div class="text-sm text-gray-500">Ejemplo</div>
          <div class="mt-1 text-2xl font-semibold">789</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  cards = [
    { label: 'Ejemplo', value: 123 },
    { label: 'Ejemplo', value: 456 },
    { label: 'Ejemplo', value: 789 },
  ];
}
