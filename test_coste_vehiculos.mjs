import assert from 'node:assert/strict';
import {calcularCosteVehiculo,leerEuros} from './docs/coste-vehiculos/calc.js';

assert.equal(leerEuros('200,50'),200.5);
assert.equal(leerEuros('200.50'),200.5);
assert.equal(leerEuros('0'),0);
assert.equal(leerEuros(''),null);
assert.equal(leerEuros('1.000,00'),null);
const ejemplo=calcularCosteVehiculo(25000,26000,[200,100,50,40,300,10]);
assert.deepEqual(ejemplo,{kilometros:1000,costeTotal:700,costePorKm:0.7});
const sinMovimiento=calcularCosteVehiculo(100,100,[0,0,0,40,300,0]);
assert.equal(sinMovimiento.costeTotal,340);
assert.equal(sinMovimiento.costePorKm,null);
assert.throws(()=>calcularCosteVehiculo(101,100,[0,0,0,0,0,0]));
assert.throws(()=>calcularCosteVehiculo(0,100,[0,0,null,0,0,0]));
assert.throws(()=>calcularCosteVehiculo(0,100,[0,0,-1,0,0,0]));
assert.throws(()=>calcularCosteVehiculo(0,100,[0,0,0.001,0,0,0]));
assert.equal(calcularCosteVehiculo(0,3,[0.10,0.20,0,0,0,0]).costeTotal,0.30);
console.log('OK: ejemplo, cero km, decimales, entradas incompletas y negativas');
