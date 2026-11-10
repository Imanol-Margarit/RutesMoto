import { Component, OnDestroy, input, output } from '@angular/core';

/** Buscador con debounce: emite el término solo cuando el usuario deja de escribir. */
@Component({
  selector: 'app-search-bar',
  template: `
    <input type="search" class="input" [placeholder]="placeholder()" [value]="value()"
           (input)="onInput(textOf($event))" aria-label="Buscar" />
  `
})
export class SearchBar implements OnDestroy {
  value = input('');
  placeholder = input('Buscar rutas...');
  delay = input(350);
  searchChange = output<string>();

  private timer: ReturnType<typeof setTimeout> | undefined;

  onInput(text: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.searchChange.emit(text.trim()), this.delay());
  }

  textOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
