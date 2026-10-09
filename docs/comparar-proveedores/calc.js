export function compararPresupuestos(unidades, ofertas) {
  if (!Number.isSafeInteger(unidades) || unidades <= 0) throw new Error('Introduce un número entero de unidades mayor que cero.');
  if (!Array.isArray(ofertas) || ofertas.length !== 3) throw new Error('Se esperan tres espacios para ofertas.');
  const completas = [];
  for (let i = 0; i < ofertas.length; i++) {
    const o = ofertas[i];
    const campos = [o.nombre, o.precio, o.envio, o.plazo];
    if (campos.every(v => v === '' || v === null || v === undefined)) continue;
    if (typeof o.nombre !== 'string' || !o.nombre.trim() || !Number.isFinite(o.precio) || !Number.isFinite(o.envio) || !Number.isSafeInteger(o.plazo) || o.precio < 0 || o.envio < 0 || o.plazo < 0) {
      throw new Error(`Completa y revisa la oferta ${i + 1}: nombre, precio, envío y plazo entero no negativos.`);
    }
    const total = unidades * o.precio + o.envio;
    if (!Number.isFinite(total) || total > 1e12) throw new Error('El importe calculado es demasiado grande.');
    completas.push({nombre:o.nombre.trim(), precio:o.precio, envio:o.envio, plazo:o.plazo, total, orden:i});
  }
  if (!completas.length) throw new Error('Añade al menos una oferta completa.');
  const porCoste = [...completas].sort((a,b)=>a.total-b.total || a.orden-b.orden);
  const porPlazo = [...completas].sort((a,b)=>a.plazo-b.plazo || a.total-b.total || a.orden-b.orden);
  return {
    ofertas:completas,
    masBarata:porCoste[0],
    masRapida:porPlazo[0],
    ahorroPotencial:porCoste.length>1 ? porCoste.at(-1).total-porCoste[0].total : 0,
    diferenciaSegundo:porCoste.length>1 ? porCoste[1].total-porCoste[0].total : null
  };
}

export function leerDecimal(texto) {
  const raw=String(texto ?? '').trim();
  if (!raw || !/^\d+(?:[,.]\d{1,2})?$/.test(raw)) return null;
  const n=Number(raw.replace(',','.'));
  return Number.isFinite(n) ? n : null;
}
