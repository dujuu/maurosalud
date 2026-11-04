import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import type { Usuario } from './models';

const CLAVE = 'vida-norte.sesion';
const ana: Usuario = { id: 3, nombre: 'Ana Muñoz', rut: '16.789.012-1', rol: 'PACIENTE', especialidad: null };

/** JWT de prueba (sin firma real): solo importa `exp`, que es lo que lee el cliente. */
function token(expEnSegundos: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 3, exp: expEnSegundos })}.firma`;
}
const enUnaHora = () => Math.floor(Date.now() / 1000) + 3600;

function crear() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  return { auth: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController), router: TestBed.inject(Router) };
}

describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('sin sesión, verificar devuelve null y no llama al servidor', async () => {
    const { auth, http } = crear();
    expect(await auth.verificar()).toBeNull();
    http.expectNone('/api/auth/me');
  });

  it('el login guarda la sesión en sessionStorage (por pestaña), no en localStorage', () => {
    const { auth, http } = crear();
    auth.login('16.789.012-1', 'x').subscribe();
    http.expectOne('/api/auth/login').flush({ accessToken: token(enUnaHora()), usuario: ana });
    expect(auth.usuario()?.nombre).toBe('Ana Muñoz');
    expect(sessionStorage.getItem(CLAVE)).not.toBeNull();
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('tras un login reciente no vuelve a verificar con el servidor', async () => {
    const { auth, http } = crear();
    auth.login('16.789.012-1', 'x').subscribe();
    http.expectOne('/api/auth/login').flush({ accessToken: token(enUnaHora()), usuario: ana });
    expect((await auth.verificar())?.rol).toBe('PACIENTE');
    http.expectNone('/api/auth/me');
  });

  it('ignora una sesión guardada con el token vencido', () => {
    sessionStorage.setItem(CLAVE, JSON.stringify({ token: token(Math.floor(Date.now() / 1000) - 60), usuario: ana }));
    const { auth } = crear();
    expect(auth.usuario()).toBeNull();
  });

  it('ignora una sesión guardada que no es JSON válido', () => {
    sessionStorage.setItem(CLAVE, 'basura{{');
    const { auth } = crear();
    expect(auth.usuario()).toBeNull();
  });

  it('verificar corrige el rol guardado con el que dice el servidor', async () => {
    // Un paciente que edita su rol a DOCTOR en el navegador no engaña a la aplicación.
    sessionStorage.setItem(CLAVE, JSON.stringify({ token: token(enUnaHora()), usuario: { ...ana, rol: 'DOCTOR' } }));
    const { auth, http } = crear();
    const pendiente = auth.verificar();
    http.expectOne('/api/auth/me').flush({ id: 3, rol: 'PACIENTE', nombre: 'Ana Muñoz' });
    expect((await pendiente)?.rol).toBe('PACIENTE');
    expect(auth.usuario()?.rol).toBe('PACIENTE');
  });

  it('verificar devuelve null si el servidor rechaza la sesión (401)', async () => {
    sessionStorage.setItem(CLAVE, JSON.stringify({ token: token(enUnaHora()), usuario: ana }));
    const { auth, http } = crear();
    const pendiente = auth.verificar();
    http.expectOne('/api/auth/me').flush({ message: 'x' }, { status: 401, statusText: 'Unauthorized' });
    expect(await pendiente).toBeNull();
  });

  it('verificar sin conexión deja pasar con lo guardado (el servidor igual exige permisos)', async () => {
    sessionStorage.setItem(CLAVE, JSON.stringify({ token: token(enUnaHora()), usuario: ana }));
    const { auth, http } = crear();
    const pendiente = auth.verificar();
    http.expectOne('/api/auth/me').error(new ProgressEvent('error'), { status: 0 });
    expect((await pendiente)?.nombre).toBe('Ana Muñoz');
  });

  it('logout borra la sesión y vuelve al login sin dejar la pantalla en el historial', () => {
    sessionStorage.setItem(CLAVE, JSON.stringify({ token: token(enUnaHora()), usuario: ana }));
    const { auth, router } = crear();
    const navegar = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    auth.logout();
    expect(auth.usuario()).toBeNull();
    expect(sessionStorage.getItem(CLAVE)).toBeNull();
    expect(navegar).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });
});
