/* Calculadora local: sin peticiones de red ni dependencias externas. */
(function () {
  'use strict';

  const HEADERS = ['factura', 'cliente', 'emision', 'vencimiento', 'importe', 'cobrado'];
  const SAMPLE = 'factura;cliente;emision;vencimiento;importe;cobrado\nF-001;Cliente A;2026-10-01;2026-10-06;1000,00;250,00\nF-002;Cliente B;2026-10-02;2026-10-12;500,00;0\nF-003;Cliente C;2026-10-03;2026-10-20;300,00;300,00';

  function parseCsv(text) {
    const source = text.replace(/^\uFEFF/, '');
    const headerLine = source.split(/\r?\n/, 1)[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';
    const records = [];
    let fields = [], field = '', quoted = false, line = 1, start = 1;
    function endRecord() {
      fields.push(field);
      records.push({ line: start, fields });
      fields = [];
      field = '';
      start = line + 1;
    }
    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      if (ch === '"') {
        if (quoted && source[i + 1] === '"') { field += '"'; i++; }
        else if (quoted) quoted = false;
        else if (field === '') quoted = true;
        else throw new Error(`Comillas inesperadas en la línea ${line}.`);
      } else if (ch === delimiter && !quoted) {
        fields.push(field); field = '';
      } else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && source[i + 1] === '\n') i++;
        endRecord(); line++;
      } else {
        field += ch;
        if (ch === '\n') line++;
      }
    }
    if (quoted) throw new Error('Hay comillas sin cerrar en el CSV.');
    if (field !== '' || fields.length > 0) endRecord();
    return records;
  }

  function cents(value) {
    const clean = String(value).trim();
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(clean)) throw new Error('importe no válido: usa hasta dos decimales y sin puntos de millar');
    const parts = clean.replace(',', '.').split('.');
    const whole = Number(parts[0]);
    const frac = Number((parts[1] || '').padEnd(2, '0'));
    const result = whole * 100 + frac;
    if (!Number.isSafeInteger(result)) throw new Error('importe demasiado grande');
    return result;
  }

  function dateDay(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
    if (!m) throw new Error('fecha no válida: usa AAAA-MM-DD');
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) throw new Error('fecha imposible');
    return Math.floor(date.getTime() / 86400000);
  }

  function analyze(text, asOf) {
    const rows = parseCsv(text);
    if (!rows.length || rows[0].fields.every(v => !v.trim())) throw new Error('El CSV está vacío.');
    if (rows.length > 5001) throw new Error('Este navegador admite hasta 5.000 facturas por cálculo.');
    const headers = rows[0].fields.map(v => v.trim().toLowerCase());
    if (new Set(headers).size !== headers.length || !HEADERS.every(h => headers.includes(h))) throw new Error('Faltan cabeceras: ' + HEADERS.join('; '));
    const date = dateDay(asOf);
    const seen = new Set();
    const valid = [], errors = [];
    const totals = { issued: 0, collected: 0, pending: 0, overdue: 0, next7: 0 };
    for (const row of rows.slice(1)) {
      if (row.fields.every(v => !v.trim())) continue;
      if (row.fields.length !== headers.length) { errors.push({ line: row.line, reason: 'número incorrecto de columnas; revisa separador y comillas' }); continue; }
      const item = Object.fromEntries(headers.map((h, i) => [h, row.fields[i].trim()]));
      try {
        const id = item.factura;
        if (!id || !item.cliente) throw new Error('falta factura o cliente');
        const issue = dateDay(item.emision), due = dateDay(item.vencimiento);
        if (due < issue) throw new Error('vencimiento anterior a emisión');
        const amount = cents(item.importe), paid = cents(item.cobrado);
        if (paid > amount) throw new Error('cobrado supera importe');
        const key = id.toLocaleLowerCase('es-ES');
        if (seen.has(key)) throw new Error('número de factura duplicado');
        seen.add(key);
        const balance = amount - paid;
        const status = balance === 0 ? 'Cobrada' : due < date ? 'Vencida' : due <= date + 7 ? 'Vence en 7 días' : 'Pendiente';
        valid.push({ id, client: item.cliente, due: item.vencimiento, status, balance });
        totals.issued += amount; totals.collected += paid; totals.pending += balance;
        if (status === 'Vencida') totals.overdue += balance;
        if (status === 'Vence en 7 días') totals.next7 += balance;
      } catch (error) {
        errors.push({ line: row.line, reason: error.message });
      }
    }
    return { valid, errors, totals, asOf };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { analyze, parseCsv, cents, dateDay };
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const fmt = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n / 100);
  const today = new Date();
  $('fecha').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  $('ejemplo').addEventListener('click', () => { $('csv').value = SAMPLE; $('fecha').value = '2026-10-09'; $('mensaje').classList.remove('error'); $('mensaje').textContent = 'Ejemplo ficticio cargado. Pulsa «Calcular saldos». '; $('resultados').hidden = true; });
  $('limpiar').addEventListener('click', () => { $('csv').value = ''; $('archivo').value = ''; $('mensaje').classList.remove('error'); $('mensaje').textContent = ''; $('resultados').hidden = true; });
  $('archivo').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { $('mensaje').classList.add('error'); $('mensaje').textContent = 'El archivo supera 2 MB. Elige uno menor.'; event.target.value = ''; return; }
    try { $('csv').value = await file.text(); $('mensaje').classList.remove('error'); $('mensaje').textContent = `Archivo «${file.name}» leído solo en tu navegador.`; $('resultados').hidden = true; }
    catch { $('mensaje').classList.add('error'); $('mensaje').textContent = 'No se pudo leer el archivo. Prueba a pegar el CSV.'; }
  });
  $('calcular').addEventListener('click', () => {
    try {
      const { valid, errors, totals, asOf } = analyze($('csv').value, $('fecha').value);
      for (const [id, value] of Object.entries({ emitido: totals.issued, cobrado: totals.collected, pendiente: totals.pending, vencido: totals.overdue, proximos: totals.next7 })) $(id).textContent = fmt(value);
      $('resumen-estado').textContent = `Corte: ${asOf} · ${valid.length} facturas válidas · ${errors.length} filas por revisar`;
      const body = $('detalle'); body.replaceChildren();
      for (const invoice of valid) {
        const tr = document.createElement('tr');
        for (const value of [invoice.id, invoice.client, invoice.due, invoice.status, fmt(invoice.balance)]) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
        tr.lastElementChild.className = 'num'; body.append(tr);
      }
      const list = $('errores'); list.replaceChildren();
      for (const error of errors) { const li = document.createElement('li'); li.textContent = `Fila ${error.line}: ${error.reason}`; list.append(li); }
      $('errores-wrap').hidden = errors.length === 0;
      $('mensaje').classList.toggle('error', errors.length > 0);
      $('mensaje').textContent = errors.length ? 'Hay filas excluidas: revisa el detalle antes de usar los totales.' : 'Cálculo realizado localmente.';
      $('resultados').hidden = false;
      $('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) { $('mensaje').classList.add('error'); $('mensaje').textContent = error.message; $('resultados').hidden = true; }
  });
})();
