import {leerEuros,calcularCosteVehiculo} from './calc.js';

const $=id=>document.getElementById(id);
const formatoEuros=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const formatoKm=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(n);
const formatoPorKm=n=>new Intl.NumberFormat('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3}).format(n)+' €/km';
const costeIds=['combustible','mantenimiento','peajes','seguro','cuota','otros'];

function calcular() {
  $('mensaje').textContent='';$('mensaje').classList.remove('error');$('resultados').hidden=true;
  try {
    const inicioText=$('inicio').value.trim(),finText=$('fin').value.trim();
    if(!/^\d+$/.test(inicioText)||!/^\d+$/.test(finText)) throw new Error('Escribe las dos lecturas del odómetro en kilómetros enteros, sin separador de millares.');
    const costes=costeIds.map(id=>leerEuros($(id).value));
    const r=calcularCosteVehiculo(Number(inicioText),Number(finText),costes);
    $('kilometros').textContent=formatoKm(r.kilometros)+' km';
    $('coste-total').textContent=formatoEuros(r.costeTotal);
    $('coste-km').textContent=r.costePorKm===null?'n.a.':formatoPorKm(r.costePorKm);
    $('resultado-nota').textContent=r.costePorKm===null?'El vehículo no recorrió kilómetros en este periodo. Los costes siguen registrados, pero no existe un coste por kilómetro.':'Estimación del coste registrado por kilómetro para este vehículo y periodo. Para comparar meses, usa siempre los mismos conceptos y criterios.';
    $('resultados').hidden=false;
  }catch(error){$('mensaje').textContent=error.message;$('mensaje').classList.add('error');}
}

$('calcular').addEventListener('click',calcular);
$('ejemplo').addEventListener('click',()=>{
  const datos={inicio:'25000',fin:'26000',combustible:'200',mantenimiento:'100',peajes:'50',seguro:'40',cuota:'300',otros:'10'};
  for(const [id,valor] of Object.entries(datos))$(id).value=valor;
  calcular();
});
$('limpiar').addEventListener('click',()=>{
  document.querySelectorAll('#calculadora input').forEach(input=>input.value='');
  $('resultados').hidden=true;$('mensaje').textContent='';$('mensaje').classList.remove('error');
});
