import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

type QueryParams = Record<string, string | number | boolean>;

/**
 * Único punto de acceso a HttpClient. Cada método devuelve una Promise,
 * así los servicios y componentes usan async/await.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: QueryParams): Promise<T> {
    return firstValueFrom(
      this.http.get<T>(this.url(path), { params }).pipe(timeout(environment.apiTimeoutMs))
    );
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(
      this.http.post<T>(this.url(path), body).pipe(timeout(environment.apiTimeoutMs))
    );
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(
      this.http.patch<T>(this.url(path), body).pipe(timeout(environment.apiTimeoutMs))
    );
  }

  delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(this.url(path)).pipe(timeout(environment.apiTimeoutMs)));
  }

  private url(path: string): string {
    return `${environment.apiUrl}/${path.replace(/^\/+/, '')}`;
  }
}
