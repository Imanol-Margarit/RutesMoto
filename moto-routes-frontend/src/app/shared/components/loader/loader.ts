import { Component } from '@angular/core';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  imports: [NgxSpinnerComponent],
  template: `
    <ngx-spinner
      bdColor="rgba(8, 47, 73, 0.35)"
      size="medium"
      color="#0f766e"
      type="ball-clip-rotate"
      [fullScreen]="true"
      [disableAnimation]="true"
      [zIndex]="2000"
      name="global-loader"
    >
      <p class="text-white text-sm tracking-wide mt-3">Cargando...</p>
    </ngx-spinner>
  `
})
export class Loader {}
