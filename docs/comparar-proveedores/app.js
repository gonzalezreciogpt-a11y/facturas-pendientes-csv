import {compararPresupuestos,leerDecimal} from './calc.js';

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const names=['A','B','C'];
function leer() {
  const unidades=Number($('unidades').value.trim());
  const ofertas=names.map(x=>{
    const nombre=$(`nombre-${x}`).value.trim();
    const p=$(`precio-${x}`).value.trim();
    const e=$(`envio-${x}`).value.trim();
    const d=$(`plazo-${x}`).value.trim();
    if (!nombre && !p && !e && !d) return {nombre:'',precio:'',envio:'',plazo:''};
    return {nombre,precio:leerDecimal(p),envio:leerDecimal(e),plazo:d===''?null:Number(d)};
  });
  return compararPresupuestos(unidades,ofertas);
}
function calcular(){
  $('mensaje').textContent='';$('mensaje').classList.remove('error');$('resultados').hidden=true;
  try {
    const r=leer();
    $('ganador').textContent=r.masBarata.nombre;
    $('menor-total').textContent=money(r.masBarata.total);
    $('menor-plazo').textContent=`${r.masRapida.nombre} · ${r.masRapida.plazo} ${r.masRapida.plazo===1?'día':'días'}`;
    $('ahorro').textContent=money(r.ahorroPotencial);
    $('diferencia').textContent=r.diferenciaSegundo===null?'Solo hay una oferta completa.':`La segunda oferta por coste está a ${money(r.diferenciaSegundo)} de la más barata.`;
    $('tabla').replaceChildren(...r.ofertas.map(o=>{
      const tr=document.createElement('tr');
      for(const v of [o.nombre,money(o.precio),money(o.envio),money(o.total),`${o.plazo} días`]){
        const td=document.createElement('td');td.textContent=v;tr.append(td);
      }
      return tr;
    }));
    $('resultados').hidden=false;
  }catch(e){$('mensaje').textContent=e.message;$('mensaje').classList.add('error');}
}
$('calcular').addEventListener('click',calcular);
$('ejemplo').addEventListener('click',()=>{
  const datos={unidades:'10','nombre-A':'Proveedor A','precio-A':'8','envio-A':'20','plazo-A':'5','nombre-B':'Proveedor B','precio-B':'9','envio-B':'0','plazo-B':'3','nombre-C':'Proveedor C','precio-C':'11','envio-C':'10','plazo-C':'2'};
  for(const [id,v] of Object.entries(datos))$(id).value=v;
  calcular();
});
$('limpiar').addEventListener('click',()=>{document.querySelectorAll('main input').forEach(x=>x.value='');$('resultados').hidden=true;$('mensaje').textContent='';});
