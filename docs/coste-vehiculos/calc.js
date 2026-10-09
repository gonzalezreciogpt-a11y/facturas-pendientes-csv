export function leerEuros(texto) {
  const valor=String(texto ?? '').trim();
  if(!/^\d+(?:[,.]\d{1,2})?$/.test(valor)) return null;
  const numero=Number(valor.replace(',','.'));
  return Number.isFinite(numero) && numero<=1e9 ? numero : null;
}

export function calcularCosteVehiculo(inicio,fin,costes) {
  if(!Number.isSafeInteger(inicio)||!Number.isSafeInteger(fin)||inicio<0||fin<inicio||fin>1e9)
    throw new Error('Revisa las lecturas: usa kilómetros enteros y un odómetro final igual o mayor que el inicial.');
  if(!Array.isArray(costes)||costes.length!==6||costes.some(x=>!Number.isFinite(x)||x<0||x>1e9||Math.round(x*100)!==x*100 && Math.abs(Math.round(x*100)-x*100)>1e-7))
    throw new Error('Completa los seis costes con importes no negativos y como máximo dos decimales. Escribe 0 si no hubo gasto.');
  const centimos=costes.reduce((total,importe)=>total+Math.round(importe*100),0);
  const km=fin-inicio;
  return {kilometros:km,costeTotal:centimos/100,costePorKm:km===0?null:centimos/100/km};
}
