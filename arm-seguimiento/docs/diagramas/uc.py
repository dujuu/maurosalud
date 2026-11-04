# Diagrama general de casos de uso (UML): actores como figuras, casos como óvalos y el límite del sistema.
W, H = 1000, 680
partes = []
def t(x, y, s, size=15, anchor='middle', weight='normal', halo=False):
    h = ' stroke="#fff" stroke-width="5" paint-order="stroke"' if halo else ''
    partes.append(f'<text x="{x}" y="{y}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="#000"{h}>{s}</text>')
def linea(x1, y1, x2, y2, dash=False):
    d = ' stroke-dasharray="6 4"' if dash else ''
    partes.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#000" stroke-width="1.4"{d}/>')

def actor(x, y, nombre):
    partes.append(f'<circle cx="{x}" cy="{y-48}" r="14" fill="#fff" stroke="#000" stroke-width="1.6"/>')
    linea(x, y-34, x, y+10); linea(x-24, y-22, x+24, y-22); linea(x, y+10, x-20, y+44); linea(x, y+10, x+20, y+44)
    t(x, y+68, nombre, 16, weight='bold')

def caso(cx, cy, texto, rx=118, ry=26):
    partes.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#fff" stroke="#000" stroke-width="1.5"/>')
    lineas = texto.split('\n')
    base = cy + 5 - (len(lineas) - 1) * 9
    for i, l in enumerate(lineas):
        t(cx, base + i * 18, l, 14)
    return (cx, cy, rx)

# límite del sistema
partes.append(f'<rect x="215" y="24" width="570" height="634" fill="#fff" stroke="#000" stroke-width="1.6"/>')
t(500, 52, 'Sistema de seguimiento y fidelización de tratamientos', 16, weight='bold')

doctor = (95, 330); paciente = (905, 330)
compartidos = [('CU-01 Iniciar sesión', 500, 110), ('CU-03 Cerrar sesión', 500, 176)]
solo_doctor = [('CU-04 Consultar mis pacientes\ny su hilo', 360, 270), ('CU-05 Enviar una\nrecomendación', 360, 350),
               ('CU-06 Ver el estado de\nlectura de lo enviado', 360, 430), ('CU-07 Ver el resumen\nde lectura', 360, 510)]
solo_paciente = [('CU-08 Ver mis\nrecomendaciones', 640, 270), ('CU-09 Marcar una recomendación\ncomo leída', 640, 350)]

for etiqueta, cx, cy in compartidos:
    rx = 118
    linea(doctor[0] + 24, doctor[1] - 22, cx - rx, cy)
    linea(paciente[0] - 24, paciente[1] - 22, cx + rx, cy)
for etiqueta, cx, cy in solo_doctor:
    linea(doctor[0] + 24, doctor[1] - 22, cx - 118, cy)
for etiqueta, cx, cy in solo_paciente:
    linea(paciente[0] - 24, paciente[1] - 22, cx + 118, cy)
for etiqueta, cx, cy in compartidos + solo_doctor + solo_paciente:
    caso(cx, cy, etiqueta)
actor(*doctor, 'Doctor'); actor(*paciente, 'Paciente')

# casos internos (incluidos por los demás)
caso(500, 575, 'CU-02 Verificar la sesión\nCU-10 Autorizar cada petición', rx=165, ry=30)
for etiqueta, cx, cy in solo_doctor[-1:] + solo_paciente[-1:]:
    pass
linea(360, 536, 440, 548, dash=True); linea(640, 376, 560, 546, dash=True)
t(392, 536, '«include»', 12, halo=True); t(617, 462, '«include»', 12, halo=True)
t(500, 640, 'Los demás casos protegidos también incluyen CU-02 y CU-10', 12)

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="#fff"/>' + '\n'.join(partes) + '</svg>'
open('uc.svg', 'w', encoding='utf-8').write(svg)
