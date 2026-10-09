import assert from 'node:assert/strict';
import {compararPresupuestos,leerDecimal} from './docs/comparar-proveedores/calc.js';

const ofertas=[
  {nombre:'A',precio:8,envio:20,plazo:5},
  {nombre:'B',precio:9,envio:0,plazo:3},
  {nombre:'C',precio:11,envio:10,plazo:2}
];
let r=compararPresupuestos(10,ofertas);
assert.equal(r.masBarata.nombre,'B');
assert.equal(r.masBarata.total,90);
assert.equal(r.masRapida.nombre,'C');
assert.equal(r.ahorroPotencial,30);
assert.equal(r.diferenciaSegundo,10);
r=compararPresupuestos(1,[ofertas[0],{nombre:'',precio:'',envio:'',plazo:''},{nombre:'',precio:'',envio:'',plazo:''}]);
assert.equal(r.ahorroPotencial,0);
assert.equal(r.diferenciaSegundo,null);
assert.throws(()=>compararPresupuestos(1.5,ofertas),/entero/);
assert.throws(()=>compararPresupuestos(2,[{nombre:'A',precio:-1,envio:0,plazo:1},ofertas[1],ofertas[2]]),/oferta 1/);
assert.throws(()=>compararPresupuestos(2,[{nombre:'A',precio:1,envio:null,plazo:1},ofertas[1],ofertas[2]]),/oferta 1/);
assert.throws(()=>compararPresupuestos(2,[{nombre:'',precio:'',envio:'',plazo:''},{nombre:'',precio:'',envio:'',plazo:''},{nombre:'',precio:'',envio:'',plazo:''}]),/al menos una/);
assert.equal(leerDecimal('8,50'),8.5);
assert.equal(leerDecimal('8.50'),8.5);
assert.equal(leerDecimal('1.000,00'),null);
console.log('OK: totales, coste, plazo, ahorro, una oferta, validaciones y decimales');
