import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loader',
  template: `
    @if (loading.isLoading()) {
      <div class="h-1 w-full animate-pulse bg-teal-600" aria-hidden="true"></div>
    }
  `
})
export class Loader {
  readonly loading = inject(LoadingService);
}