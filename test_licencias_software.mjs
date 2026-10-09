import assert from 'node:assert/strict';
import {calcularLicencias,leerEntero,leerImporte} from './docs/licencias-software/calc.js';

const base=calcularLicencias({contratadas:10,asignadas:7,tarifa:12,cobro:'Mensual'});
assert.equal(base.libres,3);assert.equal(base.mensualEquivalente,120);assert.equal(base.sinUsoMensual,36);assert.equal(base.anualEquivalente,1440);
const anual=calcularLicencias({contratadas:5,asignadas:5,tarifa:100,cobro:'Anual'});
assert.equal(anual.totalPeriodo,500);assert.ok(Math.abs(anual.mensualEquivalente-500/12)<1e-9);assert.equal(anual.sinUsoMensual,0);
const cero=calcularLicencias({contratadas:1,asignadas:0,tarifa:0,cobro:'Mensual'});
assert.equal(cero.libres,1);assert.equal(cero.mensualEquivalente,0);
for(const datos of [
 {contratadas:0,asignadas:0,tarifa:1,cobro:'Mensual'},
 {contratadas:1.5,asignadas:1,tarifa:1,cobro:'Mensual'},
 {contratadas:2,asignadas:3,tarifa:1,cobro:'Mensual'},
 {contratadas:2,asignadas:-1,tarifa:1,cobro:'Mensual'},
 {contratadas:2,asignadas:1,tarifa:-1,cobro:'Mensual'},
 {contratadas:2,asignadas:1,tarifa:1,cobro:'Trimestral'}
])assert.throws(()=>calcularLicencias(datos));
assert.equal(leerEntero('10'),10);assert.equal(leerEntero('1,5'),null);assert.equal(leerImporte('12,50'),12.5);assert.equal(leerImporte('1.000'),null);
console.log('OK: planes mensuales y anuales, cero válido, entradas inválidas y coma decimal');
