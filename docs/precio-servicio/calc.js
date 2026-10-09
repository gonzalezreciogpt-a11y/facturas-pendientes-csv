export function parseDecimal(input) {
  const value = String(input ?? '').trim().replace(',', '.');
  if (!/^(?:\d+)(?:\.\d+)?$/.test(value)) return NaN;
  return Number(value);
}

export function calculatePricing({cost, marginPercent, variableFeePercent, fixedFee, quotedPrice}) {
  const values = [cost, marginPercent, variableFeePercent, fixedFee];
  if (values.some(x => !Number.isFinite(x))) throw new Error('Introduce cuatro números válidos. Usa coma o punto decimal, sin separadores de millares.');
  if (cost <= 0 || fixedFee < 0 || marginPercent < 0 || marginPercent >= 100 || variableFeePercent < 0 || variableFeePercent >= 100) {
    throw new Error('El coste debe ser positivo; las comisiones no pueden ser negativas; los porcentajes deben estar entre 0 y menos de 100.');
  }
  const margin = marginPercent / 100;
  const variableFee = variableFeePercent / 100;
  const exactMinimum = (cost / (1 - margin) + fixedFee) / (1 - variableFee);
  if (!Number.isFinite(exactMinimum) || exactMinimum > 1e12) throw new Error('El resultado es demasiado grande para ofrecer un cálculo fiable.');
  // Match the paid workbook: round the suggested selling price up to a whole euro.
  const suggested = Math.ceil(exactMinimum - 1e-10);
  const fee = suggested * variableFee + fixedFee;
  const afterFee = suggested - fee;
  const profit = afterFee - cost;
  const result = {suggested, fee, afterFee, profit, achievedMarginPercent:profit / afterFee * 100};
  if (quotedPrice !== undefined && quotedPrice !== null && quotedPrice !== '') {
    if (!Number.isFinite(quotedPrice) || quotedPrice <= 0) throw new Error('El precio propuesto debe ser un número positivo.');
    const quoteFee = quotedPrice * variableFee + fixedFee;
    const quoteAfterFee = quotedPrice - quoteFee;
    const quoteProfit = quoteAfterFee - cost;
    result.quote = {price:quotedPrice, fee:quoteFee, afterFee:quoteAfterFee, profit:quoteProfit,
      marginPercent:quoteAfterFee > 0 ? quoteProfit / quoteAfterFee * 100 : null,
      meetsTarget:quoteAfterFee > 0 && quoteProfit / quoteAfterFee >= margin - 1e-12};
  }
  return result;
}
