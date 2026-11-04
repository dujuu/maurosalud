import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, map, tap, type Observable } from 'rxjs';
import type { LoginRespuesta, Rol, Usuario } from './models';

const CLAVE_SESION = 'vida-norte.sesion';

interface Sesion {
  /** Token JWT que se envía en cada petición. */
  token: string;
  /** Datos del usuario, para mostrar su nombre y decidir su pantalla. */
  usuario: Usuario;
}

/**
 * La sesión vive en `sessionStorage`: es por pestaña. Así se pueden tener dos pestañas con usuarios
 * distintos (por ejemplo, doctor y paciente) y la sesión se cierra sola al cerrar la pestaña.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Cliente HTTP para el inicio de sesión y la verificación. */
  private readonly http = inject(HttpClient);
  /** Router, para volver al login al cerrar la sesión. */
  private readonly router = inject(Router);

  /** Sesión actual. Se lee de `sessionStorage` al crear el servicio; es `null` si no hay. */
  private readonly sesion = signal<Sesion | null>(this.leerSesion());
  /** El servidor confirma quién es el usuario una vez por carga de página. */
  private verificada = false;

  /** Usuario con sesión abierta, o `null`. */
  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  /** Token JWT de la sesión, o `null`. */
  readonly token = computed(() => this.sesion()?.token ?? null);

  /**
   * Inicia sesión en la API y guarda la sesión de la pestaña.
   *
   * @param rut RUT tal como lo escribió el usuario.
   * @param password Contraseña.
   * @returns El usuario autenticado. Falla con el error HTTP de la API (400 o 401).
   */
  login(rut: string, password: string): Observable<Usuario> {
    return this.http.post<LoginRespuesta>('/api/auth/login', { rut, password }).pipe(
      tap((r) => {
        this.guardarSesion({ token: r.accessToken, usuario: r.usuario });
        this.verificada = true; // los datos acaban de venir del servidor
      }),
      map((r) => r.usuario),
    );
  }

  /**
   * Pregunta al servidor quién es el usuario y corrige lo guardado en el navegador (rol, nombre).
   * Devuelve `null` si no hay sesión o el servidor la rechaza. Sin conexión no se puede verificar:
   * se deja pasar con lo guardado y el servidor igual exige permisos en cada petición.
   */
  async verificar(): Promise<Usuario | null> {
    const actual = this.sesion();
    if (!actual) return null;
    if (this.verificada) return actual.usuario;

    try {
      const yo = await firstValueFrom(
        this.http.get<{ id: number; rol: Rol; nombre: string }>('/api/auth/me'),
      );
      this.verificada = true;
      if (yo.rol !== actual.usuario.rol || yo.nombre !== actual.usuario.nombre) {
        this.guardarSesion({ token: actual.token, usuario: { ...actual.usuario, rol: yo.rol, nombre: yo.nombre } });
      }
      return this.sesion()?.usuario ?? null;
    } catch (err) {
      const sinConexion = err instanceof HttpErrorResponse && (err.status === 0 || err.status >= 500);
      return sinConexion ? actual.usuario : null; // un 401 ya cerró la sesión en el interceptor
    }
  }

  /**
   * Cierra la sesión de la pestaña. Es solo local: la API no guarda sesiones, así que el token sigue
   * siendo válido hasta que venza.
   */
  logout(): void {
    this.sesion.set(null);
    this.verificada = false;
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      /* almacenamiento no disponible */
    }
    // replaceUrl: la pantalla protegida no queda en el historial (el botón Atrás no vuelve a ella).
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /** Pantalla de inicio según el rol. */
  rutaInicio(rol: Rol): string {
    return rol === 'DOCTOR' ? '/doctor' : '/paciente';
  }

  /** Guarda la sesión en memoria y en `sessionStorage`. */
  private guardarSesion(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      /* la sesión sigue en memoria */
    }
  }

  /** Lee la sesión guardada. Devuelve `null` si no hay, está dañada o el token ya venció. */
  private leerSesion(): Sesion | null {
    try {
      localStorage.removeItem(CLAVE_SESION); // restos de la versión anterior, que guardaba en localStorage
      const crudo = sessionStorage.getItem(CLAVE_SESION);
      if (!crudo) return null;
      const sesion = JSON.parse(crudo) as Sesion;
      return this.expirado(sesion.token) ? null : sesion;
    } catch {
      return null;
    }
  }

  /** Revisa `exp` del JWT para no arrancar con una sesión vencida. */
  private expirado(token: string): boolean {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(base64)) as { exp?: number };
      return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
