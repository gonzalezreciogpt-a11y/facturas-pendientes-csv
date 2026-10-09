import assert from 'node:assert/strict';
import {leerNumero,calcularReparacion} from './docs/reparaciones-coste-margen-cobro/calc.js';

assert.equal(leerNumero('20,50'),20.5);
assert.equal(leerNumero('0'),0);
for(const invalido of ['', '-1', '1.000,00', '0,001', 'Infinity']) assert.throws(()=>leerNumero(invalido));
const ejemplo=calcularReparacion({horas:2,costeHora:20,manoObra:90,piezasCoste:30,piezasVenta:55,otros:5,cobrado:100});
assert.deepEqual(ejemplo,{coste:75,facturado:145,margen:70,pendiente:45});
assert.deepEqual(calcularReparacion({horas:1,costeHora:20,manoObra:0,piezasCoste:10,piezasVenta:0,otros:0,cobrado:0}),{coste:30,facturado:0,margen:-30,pendiente:0});
assert.throws(()=>calcularReparacion({horas:1,costeHora:20,manoObra:10,piezasCoste:0,piezasVenta:0,otros:0,cobrado:11}));
assert.equal(calcularReparacion({horas:0.1,costeHora:0.2,manoObra:0.1,piezasCoste:0.2,piezasVenta:0.2,otros:0.1,cobrado:0.3}).pendiente,0);
console.log('OK: ejemplo, garantía, sobrecobro, decimales y valores inválidos');
