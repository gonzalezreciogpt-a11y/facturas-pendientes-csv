export function calcularLicencias({contratadas, asignadas, tarifa, cobro}) {
  if (!Number.isSafeInteger(contratadas) || contratadas <= 0) throw new Error('Las plazas contratadas deben ser un entero mayor que cero.');
  if (!Number.isSafeInteger(asignadas) || asignadas < 0 || asignadas > contratadas) throw new Error('Las plazas asignadas deben ser un entero entre cero y las contratadas.');
  if (!Number.isFinite(tarifa) || tarifa < 0 || tarifa > 1e8) throw new Error('Introduce una tarifa por plaza válida y no negativa.');
  if (!['Mensual','Anual'].includes(cobro)) throw new Error('Elige si la tarifa por plaza es mensual o anual.');
  const divisor=cobro==='Anual'?12:1;
  const libres=contratadas-asignadas;
  const totalPeriodo=contratadas*tarifa;
  const sinUsoPeriodo=libres*tarifa;
  if (!Number.isFinite(totalPeriodo) || totalPeriodo > 1e12) throw new Error('El importe calculado es demasiado grande.');
  return {libres,totalPeriodo,sinUsoPeriodo,mensualEquivalente:totalPeriodo/divisor,sinUsoMensual:sinUsoPeriodo/divisor,anualEquivalente:totalPeriodo*(12/divisor)};
}

export function leerEntero(texto) {
  const raw=String(texto??'').trim();
  if (!/^\d+$/.test(raw)) return null;
  const n=Number(raw);
  return Number.isSafeInteger(n)?n:null;
}

export function leerImporte(texto) {
  const raw=String(texto??'').trim();
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(raw)) return null;
  const n=Number(raw.replace(',','.'));
  return Number.isFinite(n)?n:null;
}
