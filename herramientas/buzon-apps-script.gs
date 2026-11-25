/**
 * Khito Labs · Buzón de sugerencias y quejas
 * ------------------------------------------------------------
 * Pega este código en una hoja de cálculo de Google:
 *   Extensiones → Apps Script → reemplaza todo → Guardar.
 * Cambia ADMIN_KEY por una clave secreta tuya (no la compartas).
 * Luego: Implementar → Nueva implementación → Aplicación web
 *   - Ejecutar como: Yo
 *   - Quién tiene acceso: Cualquier usuario
 * Copia la URL que termina en /exec y ponla en index.html (KL_BUZON_URL).
 *
 * Los mensajes se guardan en la pestaña "Buzón" de esta hoja.
 * Puedes responder y marcar "resuelto" desde la página (modo administrador)
 * o directamente en la hoja.
 */
const ADMIN_KEY = 'CAMBIA-ESTA-CLAVE';
const HOJA = 'Buzón';
const TIPOS = ['Sugerencia', 'Queja', 'Error en el contenido', 'Otro'];
const COLS = ['id', 'fecha', 'tipo', 'nombre', 'mensaje', 'pagina', 'respuesta', 'resuelto', 'oculto', 'fecha_respuesta'];

function hoja_() {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName(HOJA);
  if (!s) {
    s = ss.insertSheet(HOJA);
    s.appendRow(COLS);
    s.setFrozenRows(1);
  }
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Evita que un texto que empieza con = + - @ se interprete como fórmula. */
function limpio_(s, max) {
  s = String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function filas_() {
  const v = hoja_().getDataRange().getValues();
  v.shift();
  return v.map(function (r, i) {
    return {
      fila: i + 2, id: String(r[0]), fecha: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      tipo: String(r[2]), nombre: String(r[3]), mensaje: String(r[4]), pagina: String(r[5]),
      respuesta: String(r[6] || ''), resuelto: r[7] === true, oculto: r[8] === true,
      fecha_respuesta: r[9] instanceof Date ? r[9].toISOString() : String(r[9] || '')
    };
  }).filter(function (x) { return x.id; });
}

function esAdmin_(k) { return !!k && ADMIN_KEY !== 'CAMBIA-ESTA-CLAVE' && k === ADMIN_KEY; }

function doGet(e) {
  const p = (e && e.parameter) || {};
  const admin = esAdmin_(p.key);
  if (p.action === 'auth') return json_({ ok: admin });
  const items = filas_().filter(function (x) { return admin || !x.oculto; }).reverse().slice(0, 300)
    .map(function (x) { delete x.fila; if (!admin) delete x.oculto; return x; });
  return json_({ ok: true, admin: admin, items: items });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'formato' }); }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (d.action === 'add') {
      if (d.hp) return json_({ ok: true });                       // trampa para bots
      const msg = limpio_(d.mensaje, 1500);
      if (msg.replace(/^'/, '').length < 5) return json_({ ok: false, error: 'corto' });
      const cache = CacheService.getScriptCache();                 // límite: 30 mensajes por minuto en total
      const n = Number(cache.get('n') || 0);
      if (n >= 30) return json_({ ok: false, error: 'espera' });
      cache.put('n', String(n + 1), 60);
      const tipo = TIPOS.indexOf(d.tipo) >= 0 ? d.tipo : 'Otro';
      const nombre = limpio_(d.nombre, 40) || 'Anónimo';
      const id = Utilities.getUuid().slice(0, 8);
      const s = hoja_();
      s.appendRow([id, new Date(), tipo, nombre, msg, limpio_(d.pagina, 120), '', false, false, '']);
      s.getRange(s.getLastRow(), 8, 1, 2).insertCheckboxes();
      return json_({ ok: true, id: id });
    }
    if (!esAdmin_(d.key)) return json_({ ok: false, error: 'clave' });
    const f = filas_().filter(function (x) { return x.id === String(d.id); })[0];
    if (!f) return json_({ ok: false, error: 'no-existe' });
    const s = hoja_();
    if (d.action === 'reply') {
      s.getRange(f.fila, 7).setValue(limpio_(d.respuesta, 2000));
      s.getRange(f.fila, 10).setValue(new Date());
    } else if (d.action === 'resolve') {
      s.getRange(f.fila, 8).setValue(!!d.valor);
    } else if (d.action === 'hide') {
      s.getRange(f.fila, 9).setValue(!!d.valor);
    } else if (d.action === 'delete') {
      s.deleteRow(f.fila);
    } else {
      return json_({ ok: false, error: 'accion' });
    }
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
