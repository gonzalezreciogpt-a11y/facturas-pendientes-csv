// Importes positivos, como máximo dos decimales. Las horas también se expresan con centésimas.
export function leerNumero(texto) {
  const s=String(texto??'').trim();
  if(!/^\d+(?:[.,]\d{1,2})?$/.test(s)) throw new Error('Completa todos los campos con números no negativos de hasta dos decimales, sin separador de millares. Usa 0 cuando corresponda.');
  const n=Number(s.replace(',','.'));
  if(!Number.isSafeInteger(Math.round(n*100))||n>1_000_000) throw new Error('El valor es demasiado grande para calcularlo con seguridad.');
  return n;
}

const centimos=n=>Math.round(n*100);
export function calcularReparacion({horas,costeHora,manoObra,piezasCoste,piezasVenta,otros,cobrado}) {
  const datos=[horas,costeHora,manoObra,piezasCoste,piezasVenta,otros,cobrado];
  if(datos.some(v=>!Number.isFinite(v)||v<0||v>1_000_000||Math.round(v*100)/100!==v)) throw new Error('Revisa los importes: deben ser números no negativos de hasta dos decimales.');
  const coste=centimos(horas*costeHora)+centimos(piezasCoste)+centimos(otros);
  const factura=centimos(manoObra)+centimos(piezasVenta);
  const recibido=centimos(cobrado);
  if(recibido>factura) throw new Error('El importe cobrado supera lo facturado. Revisa los datos antes de calcular el pendiente.');
  return {coste:coste/100,facturado:factura/100,margen:(factura-coste)/100,pendiente:(factura-recibido)/100};
}
