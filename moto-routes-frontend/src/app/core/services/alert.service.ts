import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  async success(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#0f766e'
    });
  }

  async error(title: string, text: string): Promise<void> {
    await Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#ef4444'
    });
  }

  async confirm(title: string, text: string, confirmText = 'Confirmar'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#6b7280'
    });
  }

  /** Aviso rápido que se cierra solo (no pide pulsar Aceptar). */
  async toast(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 1800,
      showConfirmButton: false
    });
  }
}
