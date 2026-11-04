/**
 * Carga los datos de demostración: dos doctores, tres pacientes, sus asignaciones y ocho recomendaciones.
 *
 * Es repetible: busca cada registro antes de crearlo, así que ejecutarlo varias veces no duplica nada.
 * Con `--reset` borra primero las recomendaciones y las vuelve a crear (deja la demostración como nueva).
 *
 * Uso: `npm run seed` o `npm run seed:reset`.
 */
import bcrypt from 'bcryptjs';
import { DoctorPaciente } from '../asignaciones/doctor-paciente.entity.js';
import { formatearRut, normalizarRut } from '../common/rut.util.js';
import { Rol } from '../usuarios/rol.enum.js';
import { Recomendacion } from '../recomendaciones/recomendacion.entity.js';
import { TipoRecomendacion } from '../recomendaciones/tipo-recomendacion.enum.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import dataSource from './data-source.js';

/** Contraseña única para todos los usuarios de demostración. */
const PASSWORD_DEMO = 'Vida2026';

/** Doctores de demostración. Los RUT son ficticios, con dígito verificador válido. */
const DOCTORES = [
  { rut: '12.345.678-5', nombre: 'Dr. Rodrigo Salas', especialidad: 'Medicina General' },
  { rut: '14.567.890-0', nombre: 'Dra. Paula Contreras', especialidad: 'Kinesiología' },
];
/** Pacientes de demostración. */
const PACIENTES = [
  { rut: '16.789.012-1', nombre: 'Ana Muñoz' },
  { rut: '18.234.567-9', nombre: 'Carlos Pérez' },
  { rut: '19.345.678-2', nombre: 'Sofía Araya' },
];
/** Asignaciones `[rut del doctor, rut del paciente]`. Carlos Pérez tiene a los dos doctores. */
const ASIGNACIONES: Array<[string, string]> = [
  ['12.345.678-5', '16.789.012-1'], // Salas  -> Ana
  ['12.345.678-5', '18.234.567-9'], // Salas  -> Carlos
  ['14.567.890-0', '18.234.567-9'], // Contreras -> Carlos (paciente compartido)
  ['14.567.890-0', '19.345.678-2'], // Contreras -> Sofía
];

/** Fecha de hace `dias` días y `horas` horas, para escalonar las recomendaciones de ejemplo. */
const hace = (dias: number, horas = 0) => new Date(Date.now() - dias * 86_400_000 - horas * 3_600_000);

/** Recomendaciones de ejemplo: [rut doctor, rut paciente, tipo, título, indicaciones, hace cuántos días, leída (horas después)]. */
const RECOMENDACIONES: Array<[string, string, TipoRecomendacion, string, string, number, number | null]> = [
  ['12.345.678-5', '16.789.012-1', TipoRecomendacion.MEDICAMENTO, 'Paracetamol cada 8 horas',
    'Tome 1 comprimido de 500 mg cada 8 horas durante 3 días, después de las comidas. Si la fiebre sigue pasadas 48 horas, pida una hora de control.', 6, 2],
  ['12.345.678-5', '16.789.012-1', TipoRecomendacion.HABITO_EVITAR, 'Evitar el alcohol durante el tratamiento',
    'No consuma alcohol mientras tome el antibiótico (7 días). Si tiene dudas sobre otros medicamentos, consulte antes de tomarlos.', 2, null],
  ['12.345.678-5', '18.234.567-9', TipoRecomendacion.MEDICAMENTO, 'Ibuprofeno con comida',
    'Tome 1 comprimido de 400 mg cada 8 horas solo si hay dolor, siempre con alimentos. No lo use más de 5 días seguidos.', 7, 5],
  ['12.345.678-5', '18.234.567-9', TipoRecomendacion.RUTINA, 'Caminata diaria',
    'Camine 30 minutos al día a ritmo suave, de preferencia por la mañana. Si se siente bien, suba 5 minutos cada semana.', 4, null],
  ['14.567.890-0', '18.234.567-9', TipoRecomendacion.RUTINA, 'Ejercicios de movilidad de hombro',
    'Haga 3 series de 10 repeticiones, dos veces al día. Deténgase si siente un dolor punzante.', 3, 20],
  ['14.567.890-0', '18.234.567-9', TipoRecomendacion.HABITO_EVITAR, 'Evitar cargar peso',
    'No levante objetos de más de 5 kg durante las próximas dos semanas.', 1, null],
  ['14.567.890-0', '19.345.678-2', TipoRecomendacion.RUTINA, 'Estiramientos de espalda',
    'Estire la espalda baja 10 minutos al despertar y antes de dormir, sin rebotes ni movimientos bruscos.', 8, null],
  ['14.567.890-0', '19.345.678-2', TipoRecomendacion.OTRO, 'Control en dos semanas',
    'Agende una hora de control para evaluar cómo va su recuperación.', 5, 30],
];

/** Crea los usuarios, las asignaciones y las recomendaciones que todavía no existen. */
async function main() {
  await dataSource.initialize();
  const usuarios = dataSource.getRepository(Usuario);
  const asignaciones = dataSource.getRepository(DoctorPaciente);
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);

  const ids = new Map<string, number>();
  const todos = [
    ...DOCTORES.map((d) => ({ ...d, rol: Rol.DOCTOR })),
    ...PACIENTES.map((p) => ({ ...p, especialidad: null, rol: Rol.PACIENTE })),
  ];
  for (const u of todos) {
    const rut = normalizarRut(u.rut);
    if (!rut) throw new Error(`RUT de seed inválido: ${u.rut}`);
    let fila = await usuarios.findOneBy({ rut });
    if (!fila) {
      fila = await usuarios.save(
        usuarios.create({ rut, nombre: u.nombre, rol: u.rol, especialidad: u.especialidad, passwordHash, activo: true }),
      );
    }
    ids.set(rut, fila.id);
  }

  for (const [rutDoctor, rutPaciente] of ASIGNACIONES) {
    const doctorId = ids.get(normalizarRut(rutDoctor)!)!;
    const pacienteId = ids.get(normalizarRut(rutPaciente)!)!;
    if (!(await asignaciones.existsBy({ doctorId, pacienteId }))) {
      await asignaciones.save(asignaciones.create({ doctorId, pacienteId }));
    }
  }

  // Recomendaciones de ejemplo. `--reset` borra las existentes para dejar la demo como nueva.
  const recomendaciones = dataSource.getRepository(Recomendacion);
  if (process.argv.includes('--reset')) {
    await dataSource.query('DELETE FROM recomendaciones');
    await dataSource.query('ALTER TABLE recomendaciones AUTO_INCREMENT = 1');
  }
  for (const [rutDoctor, rutPaciente, tipo, titulo, descripcion, dias, leidaTrasHoras] of RECOMENDACIONES) {
    const doctorId = ids.get(normalizarRut(rutDoctor)!)!;
    const pacienteId = ids.get(normalizarRut(rutPaciente)!)!;
    if (await recomendaciones.existsBy({ doctorId, pacienteId, titulo })) continue;
    const creada = hace(dias);
    await recomendaciones.insert({
      doctorId,
      pacienteId,
      tipo,
      titulo,
      descripcion,
      createdAt: creada,
      leidaAt: leidaTrasHoras === null ? null : new Date(creada.getTime() + leidaTrasHoras * 3_600_000),
    });
  }

  console.log(`\nUsuarios de demostración (contraseña: ${PASSWORD_DEMO})`);
  for (const u of todos) {
    console.log(`  ${u.rol.padEnd(8)} ${formatearRut(normalizarRut(u.rut)!).padEnd(13)} ${u.nombre}`);
  }
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error(err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
