import {calcularLicencias,leerEntero,leerImporte} from './calc.js';

const $=id=>document.getElementById(id);
const euros=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});
function calcular(){
  const mensaje=$('mensaje');
  mensaje.classList.remove('error');
  $('resultados').hidden=true;
  try{
    const datos={contratadas:leerEntero($('contratadas').value),asignadas:leerEntero($('asignadas').value),tarifa:leerImporte($('tarifa').value),cobro:$('cobro').value};
    const r=calcularLicencias(datos);
    $('libres').textContent=String(r.libres);
    $('coste-mes').textContent=euros.format(r.mensualEquivalente);
    $('sin-uso').textContent=euros.format(r.sinUsoMensual);
    $('cargo').textContent=euros.format(r.totalPeriodo);
    $('coste-ano').textContent=euros.format(r.anualEquivalente);
    $('explicacion').textContent=r.libres===0?'Todas las plazas contratadas están asignadas. Revisa también el uso real y las condiciones del contrato antes de renovar.':`Tienes ${r.libres} plaza${r.libres===1?'':'s'} pagada${r.libres===1?'':'s'} sin asignar. Su coste mensual equivalente es una referencia de revisión, no un ahorro asegurado: tu contrato puede exigir permanencia, plazos de baja o un número mínimo de puestos.`;
    $('resultados').hidden=false;mensaje.textContent='Cálculo completo.';
  }catch(e){mensaje.classList.add('error');mensaje.textContent=e.message;}
}
$('calcular').addEventListener('click',calcular);
$('ejemplo').addEventListener('click',()=>{$('contratadas').value='10';$('asignadas').value='7';$('tarifa').value='12';$('cobro').value='Mensual';calcular();});
$('limpiar').addEventListener('click',()=>{for(const id of ['contratadas','asignadas','tarifa'])$(id).value='';$('cobro').value='Mensual';$('resultados').hidden=true;$('mensaje').textContent='';$('mensaje').classList.remove('error');$('contratadas').focus();});
