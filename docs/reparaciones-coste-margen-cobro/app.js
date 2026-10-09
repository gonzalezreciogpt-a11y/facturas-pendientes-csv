import {leerNumero,calcularReparacion} from './calc.js';

const $=id=>document.getElementById(id);
const euros=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const campos={horas:'horas',costeHora:'coste-hora',manoObra:'mano-obra',piezasCoste:'piezas-coste',piezasVenta:'piezas-venta',otros:'otros',cobrado:'cobrado'};

function calcular(){
  $('resultados').hidden=true;$('mensaje').textContent='';$('mensaje').classList.remove('error');
  try{
    const datos=Object.fromEntries(Object.entries(campos).map(([nombre,id])=>[nombre,leerNumero($(id).value)]));
    const r=calcularReparacion(datos);
    $('coste-total').textContent=euros(r.coste);$('facturado').textContent=euros(r.facturado);
    $('margen').textContent=euros(r.margen);$('pendiente').textContent=euros(r.pendiente);
    $('resultado-nota').textContent=r.margen<0?'Esta reparación muestra un margen bruto negativo. Comprueba horas, costes, precio y si se trata de una garantía o cortesía.':'El margen bruto es una estimación antes de gastos generales e impuestos. El saldo pendiente aún no es dinero cobrado.';
    $('resultados').hidden=false;
  }catch(error){$('mensaje').textContent=error.message;$('mensaje').classList.add('error');}
}

$('calcular').addEventListener('click',calcular);
$('ejemplo').addEventListener('click',()=>{
  const ejemplo={horas:'2',costeHora:'20',manoObra:'90',piezasCoste:'30',piezasVenta:'55',otros:'5',cobrado:'100'};
  for(const [nombre,valor] of Object.entries(ejemplo))$(campos[nombre]).value=valor;
  calcular();
});
$('limpiar').addEventListener('click',()=>{
  for(const id of Object.values(campos))$(id).value='';
  $('resultados').hidden=true;$('mensaje').textContent='';$('mensaje').classList.remove('error');
});
