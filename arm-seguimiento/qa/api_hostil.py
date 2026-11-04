"""Batería de pruebas de la API con entradas hostiles.

Requiere el backend en http://localhost:3000, la base de datos con el seed cargado y el cliente mariadb en el PATH.
Al terminar borra las recomendaciones: vuelva a cargar los datos de demostración con "npm run seed:reset" en la carpeta backend.
Uso: python3 qa/api_hostil.py
"""
import base64, hashlib, hmac, json, os, subprocess, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

B = 'http://localhost:3000/api'
import pathlib
BACK = str(pathlib.Path(__file__).resolve().parent.parent / 'backend')
ENV = dict(l.strip().split('=', 1) for l in open(BACK + '/.env') if '=' in l and not l.startswith('#'))
PASS = 'Vida2026'
resultados = []


def call(method, path, token=None, body=None, raw=None, headers=None, ctype='application/json', base=B):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    h = {}
    if ctype:
        h['Content-Type'] = ctype
    if token:
        h['Authorization'] = 'Bearer ' + token
    if headers:
        h.update(headers)
    req = urllib.request.Request(base + path, data=data, method=method, headers=h)
    try:
        r = urllib.request.urlopen(req, timeout=20)
        return r.status, r.read().decode(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), dict(e.headers)


def check(grupo, nombre, esperado, got, cuerpo=''):
    ok = got in esperado if isinstance(esperado, (list, tuple, set)) else got == esperado
    if esperado == '!5xx':
        ok = got < 500
    resultados.append((ok, grupo, nombre, esperado, got, cuerpo[:100].replace('\n', ' ')))
    print(f"[{'OK' if ok else '!!'}] {grupo:6} {nombre:58} esperado={esperado!s:10} obtenido={got}  {'' if ok else cuerpo[:90]}")


def login(rut, pw=PASS):
    s, b, _ = call('POST', '/auth/login', body={'rut': rut, 'password': pw})
    return json.loads(b).get('accessToken') if s == 200 else None


def b64(x):
    return base64.urlsafe_b64encode(x).rstrip(b'=').decode()


def forjar(payload, secret=None, alg='HS256'):
    h = b64(json.dumps({'alg': alg, 'typ': 'JWT'}).encode())
    p = b64(json.dumps(payload).encode())
    if alg == 'none':
        return f'{h}.{p}.'
    sig = hmac.new((secret or ENV['JWT_SECRET']).encode(), f'{h}.{p}'.encode(), hashlib.sha256).digest()
    return f'{h}.{p}.{b64(sig)}'


def sql(q):
    return subprocess.run(['mariadb', '-h', '127.0.0.1', '-u', ENV['DB_USER'], ENV['DB_NAME'], '-N', '-e', q],
                          env={**os.environ, 'MYSQL_PWD': ENV['DB_PASS']}, capture_output=True, text=True).stdout.strip()


SALAS = login('12.345.678-5'); ANA = login('16.789.012-1'); SOFIA = login('19.345.678-2')
now = int(time.time())
valido = {'rut': '12.345.678-5', 'password': PASS}

print('\n=== LOGIN: entradas hostiles ===')
s, b, _ = call('POST', '/auth/login', body={}); check('login', 'body vacío {}', 400, s, b)
s, b, _ = call('POST', '/auth/login', raw=b'hola'); check('login', 'JSON inválido', 400, s, b)
s, b, _ = call('POST', '/auth/login', raw=b''); check('login', 'sin cuerpo', 400, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': 12345678, 'password': PASS}); check('login', 'rut numérico (no string)', 400, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': "' OR 1=1 --", 'password': 'x'}); check('login', 'SQLi en rut', 400, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': '12.345.678-5', 'password': "' OR '1'='1"}); check('login', "SQLi en password", 401, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': '12.345.678-5', 'password': 'a' * 73}); check('login', 'password de 73 caracteres', 400, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': '12.345.678-5', 'password': 'a' * 72}); check('login', 'password de 72 caracteres', 401, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': '  12.345.678-5  ', 'password': PASS}); check('login', 'RUT con espacios alrededor (pegado)', 200, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': '12345678-5', 'password': ['x']}); check('login', 'password como arreglo', 400, s, b)
s, b, _ = call('POST', '/auth/login', body={'rut': '12.345.678-5', 'password': 'Vída🙂2026'}); check('login', 'password unicode/emoji', 401, s, b)
s, b, _ = call('POST', '/auth/login', raw=json.dumps(valido).encode(), ctype='text/plain'); check('login', 'Content-Type text/plain', '!5xx', s, b)
s, b, _ = call('POST', '/auth/login', raw=b'{"rut":"' + b'1' * 300000 + b'"}'); check('login', 'cuerpo de 300 KB', [413, 400], s, b)
s, b, _ = call('GET', '/auth/login'); check('login', 'GET en ruta de login', 404, s, b)

print('\n=== TOKENS: falsificados, vencidos y raros ===')
ok_body = {'pacienteId': 3, 'tipo': 'OTRO', 'titulo': 'Prueba de token', 'descripcion': 'Contenido de prueba.'}
s, b, _ = call('GET', '/auth/me', headers={'Authorization': 'bearer ' + ANA}); check('token', 'esquema "bearer" en minúscula', 200, s, b)
s, b, _ = call('GET', '/auth/me', headers={'Authorization': 'Bearer'}); check('token', '"Bearer" sin token', 401, s, b)
s, b, _ = call('GET', '/auth/me', headers={'Authorization': 'Bearer a b'}); check('token', '"Bearer a b"', 401, s, b)
s, b, _ = call('GET', '/auth/me', headers={'Authorization': 'Basic abc'}); check('token', 'esquema Basic', 401, s, b)
s, b, _ = call('GET', '/auth/me?access_token=' + ANA); check('token', 'token por query string', 401, s, b)
s, b, _ = call('GET', '/auth/me', token=forjar({'sub': 1, 'rol': 'DOCTOR', 'nombre': 'x'}, alg='none')); check('token', 'alg=none', 401, s, b)
s, b, _ = call('GET', '/auth/me', token=forjar({'sub': 1, 'rol': 'DOCTOR', 'nombre': 'x', 'exp': now + 999}, secret='otro-secreto')); check('token', 'firma con otro secreto', 401, s, b)
s, b, _ = call('GET', '/auth/me', token=forjar({'sub': 3, 'rol': 'PACIENTE', 'nombre': 'Ana', 'iat': now - 9000, 'exp': now - 10})); check('token', 'token vencido (firma válida)', 401, s, b)
h, p, sg = ANA.split('.')
pl = json.loads(base64.urlsafe_b64decode(p + '==')); pl['rol'] = 'DOCTOR'
s, b, _ = call('GET', '/doctor/pacientes', token=f'{h}.{b64(json.dumps(pl).encode())}.{sg}'); check('token', 'rol alterado a DOCTOR con firma vieja', 401, s, b)
s, b, _ = call('GET', '/recomendaciones/mias', token=forjar({'sub': 9999, 'rol': 'PACIENTE', 'nombre': 'Fantasma', 'iat': now, 'exp': now + 600})); check('token', 'usuario inexistente con firma válida', 401, s, b)
sql("UPDATE usuarios SET activo=0 WHERE rut='19345678-2'")
s, b, _ = call('POST', '/auth/login', body={'rut': '19.345.678-2', 'password': PASS}); check('token', 'login de usuario DESACTIVADO', 401, s, b)
s, b, _ = call('GET', '/recomendaciones/mias', token=SOFIA); check('token', 'token viejo de usuario DESACTIVADO', 401, s, b)
sql("UPDATE usuarios SET activo=1 WHERE rut='19345678-2'")

print('\n=== RECOMENDACIONES: validación y límites (como Dr. Salas -> Ana) ===')
def crear(**kw):
    d = {**ok_body, **kw}
    return call('POST', '/recomendaciones', token=SALAS, body=d)
s, b, _ = crear(titulo='   '); check('crear', 'título solo espacios', 400, s, b)
s, b, _ = crear(descripcion='      '); check('crear', 'descripción solo espacios', 400, s, b)
s, b, _ = crear(titulo=' \t\n '); check('crear', 'título solo tab/saltos', 400, s, b)
s, b, _ = crear(titulo='a' * 150); check('crear', 'título de 150 (límite)', 201, s, b)
s, b, _ = crear(titulo='a' * 151); check('crear', 'título de 151', 400, s, b)
s, b, _ = crear(titulo='ab'); check('crear', 'título de 2', 400, s, b)
s, b, _ = crear(descripcion='d' * 2000); check('crear', 'descripción de 2000 (límite)', 201, s, b)
s, b, _ = crear(descripcion='d' * 2001); check('crear', 'descripción de 2001', 400, s, b)
s, b, _ = crear(descripcion='é' * 2000); check('crear', 'descripción 2000 caracteres multibyte', 201, s, b)
for nombre, val, esp in [('pacienteId = 0', 0, 400), ('pacienteId = -1', -1, 400), ('pacienteId = 1.5', 1.5, 400),
                         ('pacienteId = "3" (string)', '3', 400), ('pacienteId = null', None, 400),
                         ('pacienteId = [3]', [3], 400), ('pacienteId = {}', {}, 400),
                         ('pacienteId = 99999999999999 (desborda INT)', 99999999999999, [403, 400])]:
    s, b, _ = crear(pacienteId=val); check('crear', nombre, esp, s, b)
s, b, _ = crear(tipo='medicamento'); check('crear', 'tipo en minúscula', 400, s, b)
s, b, _ = crear(tipo=None); check('crear', 'tipo null', 400, s, b)
s, b, _ = call('POST', '/recomendaciones', token=SALAS, body={}); check('crear', 'body vacío', 400, s, b)
s, b, _ = call('POST', '/recomendaciones', token=SALAS, raw=b'{"pacienteId":'); check('crear', 'JSON truncado', 400, s, b)
s, b, _ = crear(titulo='<script>alert(1)</script>', descripcion='<img src=x onerror=alert(1)> & "comillas" \'simples\''); check('crear', 'HTML/script en título y texto (se guarda literal)', 201, s, b)
XSS_ID = json.loads(b).get('id') if s == 201 else None
s, b, _ = crear(titulo='Emoji 💊 y acentos áéíóú ñ', descripcion='Tomar 💊 con agua 🚰 — dos veces al día.'); check('crear', 'emoji de 4 bytes (utf8mb4)', 201, s, b)
EMOJI_ID = json.loads(b).get('id') if s == 201 else None
if EMOJI_ID:
    g = json.loads(call('GET', '/recomendaciones/mias', token=ANA)[1])
    t = next((r['titulo'] for r in g if r['id'] == EMOJI_ID), None)
    check('crear', 'emoji vuelve idéntico al leerlo', 'Emoji 💊 y acentos áéíóú ñ', t or 'no encontrado')
s, b, _ = crear(titulo='ab\u0000c'); check('crear', 'byte nulo (\\u0000) en el título', '!5xx', s, b)
s, b, _ = crear(titulo='  con espacios  '); check('crear', 'título con espacios se recorta', 201, s, b)
if s == 201:
    check('crear', '  -> título guardado recortado', 'con espacios', json.loads(b)['titulo'])
with ThreadPoolExecutor(4) as ex:
    rs = list(ex.map(lambda _: crear(titulo='Envío simultáneo')[0], range(4)))
check('crear', '4 envíos simultáneos idénticos (se aceptan todos)', True, rs == [201] * 4)

print('\n=== MARCAR LEÍDA: ids raros (como Ana) ===')
for nombre, ruta, esp in [('id 1.5', '/recomendaciones/1.5/leida', 400), ('id -1', '/recomendaciones/-1/leida', 404),
                          ('id 0', '/recomendaciones/0/leida', 404), ('id abc', '/recomendaciones/abc/leida', 400),
                          ('id 99999999999999999999', '/recomendaciones/99999999999999999999/leida', [404, 400]),
                          ('id con espacios %20 (ParseInt lo tolera)', '/recomendaciones/%201/leida', [200, 400, 404])]:
    s, b, _ = call('PATCH', ruta, token=ANA, body={}); check('leida', nombre, esp, s, b)
s, b, _ = call('PATCH', f'/recomendaciones/{EMOJI_ID}/leida', token=ANA, raw=b'basura{{'); check('leida', 'cuerpo basura (se ignora)', [200, 400], s, b)
s, b, _ = call('PATCH', f'/recomendaciones/{EMOJI_ID}/leida', token=ANA); check('leida', 'sin cuerpo ni content-type', 200, s, b)

print('\n=== OTROS: métodos, rutas, CORS, ráfaga ===')
s, b, _ = call('DELETE', f'/recomendaciones/{EMOJI_ID}', token=SALAS); check('otros', 'DELETE de recomendación (no existe esa ruta)', 404, s, b)
s, b, _ = call('PUT', f'/recomendaciones/{EMOJI_ID}', token=SALAS, body={}); check('otros', 'PUT de recomendación', 404, s, b)
s, b, _ = call('GET', '/ruta/que/no/existe', token=SALAS); check('otros', 'ruta inexistente con token', 404, s, b)
s, b, _ = call('GET', '/auth/me', base='http://localhost:3000'); check('otros', 'sin prefijo /api', 404, s, b)
s, b, _ = call('GET', '/Auth/me', token=ANA); check('otros', 'mayúsculas en la ruta (Express es insensible)', [200, 404], s, b)
s, b, h = call('OPTIONS', '/auth/login', headers={'Origin': 'http://localhost:4200', 'Access-Control-Request-Method': 'POST'})
check('otros', 'CORS: origen permitido recibe cabecera', 'http://localhost:4200', h.get('Access-Control-Allow-Origin', '(ninguna)'))
s, b, h = call('OPTIONS', '/auth/login', headers={'Origin': 'https://evil.example', 'Access-Control-Request-Method': 'POST'})
check('otros', 'CORS: origen ajeno NO recibe cabecera', '(ninguna)', h.get('Access-Control-Allow-Origin', '(ninguna)'))
t0 = time.time()
with ThreadPoolExecutor(10) as ex:
    rs = list(ex.map(lambda _: call('POST', '/auth/login', body={'rut': '12.345.678-5', 'password': 'mala'})[0], range(30)))
print(f'[INFO] otros  30 logins fallidos seguidos ({time.time()-t0:.1f}s) -> estados {sorted(set(rs))}  (PENDIENTE: sin límite de intentos)')
s, b, h = call('GET', '/auth/me', token=ANA)
print(f"[INFO] otros  X-Content-Type-Options -> {h.get('X-Content-Type-Options', '(ausente)')}  (PENDIENTE: sin helmet)")

# limpieza de lo creado por la batería
sql("DELETE FROM recomendaciones; ALTER TABLE recomendaciones AUTO_INCREMENT=1; UPDATE usuarios SET activo=1")
fallas = [r for r in resultados if not r[0]]
print(f'\nRESUMEN: {len(resultados)-len(fallas)} OK, {len(fallas)} con diferencias')
for r in fallas:
    print(f'  !! [{r[1]}] {r[2]}  (esperado {r[3]}, obtenido {r[4]})')
