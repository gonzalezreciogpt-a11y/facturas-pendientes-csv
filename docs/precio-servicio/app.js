import {parseDecimal,calculatePricing} from './calc.js';
const $=id=>document.getElementById(id);
const euros=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const percent=n=>new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:2}).format(n)+' %';
function update() {
  try {
    const raw=['coste','margen','comision','fija'].map(id=>parseDecimal($(id).value));
    const quoteText=$('precio-propuesto').value.trim();
    const result=calculatePricing({cost:raw[0],marginPercent:raw[1],variableFeePercent:raw[2],fixedFee:raw[3],quotedPrice:quoteText ? parseDecimal(quoteText) : null});
    $('precio-minimo').textContent=euros(result.suggested);
    $('comision-estimada').textContent=euros(result.fee);
    $('ingreso-neto').textContent=euros(result.afterFee);
    $('beneficio').textContent=euros(result.profit);
    $('margen-real').textContent=percent(result.achievedMarginPercent);
    $('quote').hidden=!result.quote;
    if (result.quote) {
      $('quote-price').textContent=euros(result.quote.price);
      $('quote-profit').textContent=euros(result.quote.profit);
      $('quote-margin').textContent=result.quote.marginPercent===null ? 'No calculable' : percent(result.quote.marginPercent);
      $('quote-status').textContent=result.quote.meetsTarget ? 'Cumple el margen objetivo' : 'Por debajo del margen objetivo';
      $('quote-status').className=result.quote.meetsTarget ? 'good' : 'bad';
    }
    $('resultados').hidden=false;
    $('mensaje').textContent='Cálculo actualizado. Importes antes de impuestos.';
    $('mensaje').className='message';
  } catch(error) {
    $('resultados').hidden=true;
    $('mensaje').textContent=error.message;
    $('mensaje').className='message error';
  }
}
$('calcular').addEventListener('click',update);
$('ejemplo').addEventListener('click',()=>{for(const [id,v] of Object.entries({coste:'400',margen:'30',comision:'3',fija:'0,30','precio-propuesto':'500'}))$(id).value=v;update()});
$('limpiar').addEventListener('click',()=>{for(const id of ['coste','margen','comision','fija','precio-propuesto'])$(id).value='';$('resultados').hidden=true;$('mensaje').textContent=''});
