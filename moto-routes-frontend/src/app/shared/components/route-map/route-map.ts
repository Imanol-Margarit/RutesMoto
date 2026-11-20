import { AfterViewInit, Component, ElementRef, OnDestroy, input, viewChild } from '@angular/core';
import * as L from 'leaflet';

/** Mapa de OpenStreetMap con un marcador. Gratis y sin API key. */
@Component({
  selector: 'app-route-map',
  template: `
    <!-- isolate: los paneles de Leaflet usan z-index altos; así no tapan la cabecera ni el chat -->
    <div #mapElement class="isolate h-96 w-full overflow-hidden rounded-2xl border border-sage"></div>
  `
})
export class RouteMap implements AfterViewInit, OnDestroy {
  latitude = input.required<number>();
  longitude = input.required<number>();
  label = input('');
  zoom = input(10);

  private readonly mapElement = viewChild.required<ElementRef<HTMLDivElement>>('mapElement');
  private map?: L.Map;

  ngAfterViewInit(): void {
    const position: L.LatLngExpression = [this.latitude(), this.longitude()];

    this.map = L.map(this.mapElement().nativeElement, { scrollWheelZoom: false }).setView(position, this.zoom());

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // circleMarker no necesita las imágenes del icono por defecto (que dan problemas con Angular).
    const marker = L.circleMarker(position, {
      radius: 10,
      color: '#0f766e',
      weight: 3,
      fillColor: '#14b8a6',
      fillOpacity: 0.8
    }).addTo(this.map);

    if (this.label()) marker.bindPopup(this.label());
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}