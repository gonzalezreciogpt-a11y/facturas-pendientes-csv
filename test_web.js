const assert = require('node:assert/strict');
const { analyze, cents, dateDay } = require('./docs/app.js');

const sample = 'factura;cliente;emision;vencimiento;importe;cobrado\nF-001;Cliente A;2026-10-01;2026-10-06;1000,00;250,00\nF-002;Cliente B;2026-10-02;2026-10-12;500,00;0\nF-003;Cliente C;2026-10-03;2026-10-20;300,00;300,00';
const r = analyze(sample, '2026-10-09');
assert.equal(r.valid.length, 3);
assert.equal(r.errors.length, 0);
assert.deepEqual(r.totals, { issued: 180000, collected: 55000, pending: 125000, overdue: 75000, next7: 50000 });
assert.deepEqual(r.valid.map(v => v.status), ['Vencida', 'Vence en 7 días', 'Cobrada']);

const comma = 'factura,cliente,emision,vencimiento,importe,cobrado\n"F,001","Cliente, A",2026-10-01,2026-10-09,"100,50","20,25"';
const rc = analyze(comma, '2026-10-09');
assert.equal(rc.totals.pending, 8025);
assert.equal(rc.valid[0].status, 'Vence en 7 días');
assert.equal(rc.valid[0].id, 'F,001');

const invalid = sample + '\nF-001;Duplicado;2026-10-01;2026-10-06;100;0\nF-004;Exceso;2026-10-01;2026-10-10;100;101\nF-005;Fecha;2026-02-31;2026-10-10;100;0';
const ri = analyze(invalid, '2026-10-09');
assert.equal(ri.valid.length, 3);
assert.equal(ri.errors.length, 3);
assert.deepEqual(ri.totals, r.totals);
assert.throws(() => cents('1.000,00'), /importe no válido/);
assert.throws(() => dateDay('2026-02-31'), /fecha imposible/);
assert.throws(() => analyze('', '2026-10-09'), /vacío/);
console.log('OK: ejemplo, CSV con comillas, límite de vencimiento, duplicados, sobrecobro, fechas e importes inválidos');
