# Facturas pendientes y vencidas desde un CSV

Pequeña herramienta gratuita para saber cuánto queda por cobrar, qué saldo ya venció y qué saldo vence en los próximos siete días. Todo se calcula **en tu ordenador**: el programa no envía el CSV a ningún servidor. Requiere Python 3.10 o posterior y no instala paquetes.

## Uso

Guarda tus datos como CSV UTF-8 con estas seis columnas:

```csv
factura;cliente;emision;vencimiento;importe;cobrado
F-001;Cliente A;2026-10-01;2026-10-06;1000,00;250,00
```

Las fechas usan `AAAA-MM-DD`. Se admiten `;` o `,` como separador de columnas y punto o coma como separador decimal; no uses puntos de millar. Si el separador de columnas es la coma, pon entre comillas los importes con coma decimal (`"100,50"`). `cobrado` es el importe acumulado cobrado de esa factura, no solo el último pago. Escribe `0` si todavía no se ha cobrado nada. Las cifras deben tener como máximo dos decimales y no ser negativas.

Ejecuta desde esta carpeta:

```sh
python analiza_facturas.py ejemplo-ficticio.csv --fecha 2026-10-09
```

Con el ejemplo ficticio, el resultado es: **1.800 € emitidos, 550 € cobrados, 1.250 € pendientes, 750 € vencidos y 500 € que vencen en siete días**. Una factura vence si su fecha de vencimiento es anterior a la fecha de consulta; el día exacto de vencimiento aún aparece en «vence en 7 días». Las facturas completamente cobradas no cuentan como pendientes.

El programa excluye de los totales las filas con datos incompletos, duplicados, importes negativos, más de dos decimales, cobros mayores que el importe o vencimientos anteriores a la emisión. Al terminar, muestra las filas que hay que corregir. Si hay filas inválidas, devuelve código de salida 1; si faltan las cabeceras o no puede abrir el archivo, devuelve 2.

## Alcance

Sirve para seguimiento interno de cobros. No crea facturas, no manda recordatorios, no calcula impuestos y no sustituye tu programa de facturación. Antes de tomar decisiones, comprueba que tu CSV contiene todas las facturas del periodo y que los cobros acumulados están actualizados.

Si prefieres una hoja visual sin ejecutar Python, [la plantilla Excel de facturas pendientes de Herramientas Claras](https://payhip.com/b/h5uGQ) registra hasta 120 facturas, incluye un resumen y guía, y se vende por separado. Este script gratuito funciona por sí solo y no exige comprarla.

## Pruebas

```sh
python -m unittest -v
```

## Licencia

MIT. Véase [LICENSE](LICENSE).
