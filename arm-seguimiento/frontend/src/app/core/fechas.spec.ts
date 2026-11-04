import { haceCuanto, iniciales } from './fechas';

describe('haceCuanto', () => {
  const ahora = new Date(2026, 10, 3, 15, 0); // 3 nov 2026, 15:00 hora local

  it('hoy, aunque haya pasado menos de 24 horas desde ayer', () => {
    expect(haceCuanto(new Date(2026, 10, 3, 1, 0).toISOString(), ahora)).toBe('hoy');
  });
  it('ayer cuenta por día de calendario, no por 24 horas', () => {
    expect(haceCuanto(new Date(2026, 10, 2, 23, 59).toISOString(), ahora)).toBe('ayer');
  });
  it('hace N días', () => {
    expect(haceCuanto(new Date(2026, 9, 30, 9, 0).toISOString(), ahora)).toBe('hace 4 días');
  });
});

describe('iniciales', () => {
  it('toma nombre y apellido', () => expect(iniciales('Ana Muñoz')).toBe('AM'));
  it('ignora Dr. y Dra.', () => {
    expect(iniciales('Dr. Rodrigo Salas')).toBe('RS');
    expect(iniciales('Dra. Paula Contreras')).toBe('PC');
  });
  it('funciona con un solo nombre', () => expect(iniciales('Sofía')).toBe('S'));
});
