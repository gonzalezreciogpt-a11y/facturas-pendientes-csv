"""Resumen local de facturas pendientes a partir de un CSV, sin dependencias."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import TextIO

CAMPOS = ("factura", "cliente", "emision", "vencimiento", "importe", "cobrado")


@dataclass(frozen=True)
class Factura:
    numero: str
    cliente: str
    emision: date
    vencimiento: date
    importe: Decimal
    cobrado: Decimal

    @property
    def saldo(self) -> Decimal:
        return self.importe - self.cobrado


@dataclass(frozen=True)
class ErrorFila:
    fila: int
    motivo: str


def importe_decimal(texto: str) -> Decimal:
    valor = texto.strip().replace(",", ".")
    if not valor or valor.count(".") > 1:
        raise ValueError("importe vacío o ambiguo")
    try:
        numero = Decimal(valor)
    except InvalidOperation as exc:
        raise ValueError("importe no numérico") from exc
    if not numero.is_finite() or numero < 0:
        raise ValueError("importe negativo o no finito")
    if numero.as_tuple().exponent < -2:
        raise ValueError("importe con más de dos decimales")
    return numero


def leer_facturas(archivo: TextIO) -> tuple[list[Factura], list[ErrorFila]]:
    muestra = archivo.readline()
    archivo.seek(0)
    delimitador = ";" if muestra.count(";") >= muestra.count(",") else ","
    lector = csv.DictReader(archivo, delimiter=delimitador)
    if lector.fieldnames is None:
        raise ValueError("CSV vacío")
    nombres = [nombre.strip().lower() for nombre in lector.fieldnames]
    if len(nombres) != len(set(nombres)) or not set(CAMPOS).issubset(nombres):
        raise ValueError("Cabeceras requeridas: " + ", ".join(CAMPOS))
    validas: list[Factura] = []
    errores: list[ErrorFila] = []
    vistos: set[str] = set()
    for numero_fila, bruto in enumerate(lector, start=2):
        if None in bruto:
            errores.append(ErrorFila(numero_fila, "más columnas que cabeceras; revisa el separador decimal y las comillas"))
            continue
        fila = {str(k).strip().lower(): (v or "").strip() for k, v in bruto.items() if k is not None}
        if not any(fila.values()):
            continue
        try:
            numero = fila["factura"]
            cliente = fila["cliente"]
            if not numero or not cliente:
                raise ValueError("falta factura o cliente")
            emision = date.fromisoformat(fila["emision"])
            vencimiento = date.fromisoformat(fila["vencimiento"])
            if vencimiento < emision:
                raise ValueError("vencimiento anterior a emisión")
            importe = importe_decimal(fila["importe"])
            cobrado = importe_decimal(fila["cobrado"])
            if cobrado > importe:
                raise ValueError("cobrado supera importe")
            if numero.casefold() in vistos:
                raise ValueError("número de factura duplicado")
            vistos.add(numero.casefold())
            validas.append(Factura(numero, cliente, emision, vencimiento, importe, cobrado))
        except (ValueError, KeyError) as exc:
            errores.append(ErrorFila(numero_fila, str(exc)))
    return validas, errores


def estado(factura: Factura, fecha: date) -> str:
    if factura.saldo == 0:
        return "cobrada"
    if factura.vencimiento < fecha:
        return "vencida"
    if factura.vencimiento <= fecha + timedelta(days=7):
        return "vence en 7 días"
    return "pendiente"


def resumen(facturas: list[Factura], fecha: date) -> dict[str, Decimal]:
    return {
        "emitido": sum((f.importe for f in facturas), Decimal("0")),
        "cobrado": sum((f.cobrado for f in facturas), Decimal("0")),
        "pendiente": sum((f.saldo for f in facturas), Decimal("0")),
        "vencido": sum((f.saldo for f in facturas if estado(f, fecha) == "vencida"), Decimal("0")),
        "vence_7_dias": sum((f.saldo for f in facturas if estado(f, fecha) == "vence en 7 días"), Decimal("0")),
    }


def euro(valor: Decimal) -> str:
    return f"{valor:,.2f}".replace(",", "@").replace(".", ",").replace("@", ".") + " €"


def main() -> int:
    parser = argparse.ArgumentParser(description="Analiza facturas pendientes y vencidas desde un CSV local")
    parser.add_argument("csv", type=Path, help="Archivo CSV con cabeceras factura;cliente;emision;vencimiento;importe;cobrado")
    parser.add_argument("--fecha", type=date.fromisoformat, default=date.today(), help="Fecha de consulta AAAA-MM-DD")
    args = parser.parse_args()
    try:
        with args.csv.open("r", encoding="utf-8-sig", newline="") as archivo:
            facturas, errores = leer_facturas(archivo)
    except (OSError, UnicodeError, ValueError) as exc:
        parser.exit(2, f"Error: {exc}\n")
    total = resumen(facturas, args.fecha)
    print(f"Corte: {args.fecha.isoformat()} | facturas válidas: {len(facturas)} | filas por revisar: {len(errores)}")
    for etiqueta, clave in (("Emitido", "emitido"), ("Cobrado", "cobrado"),
                           ("Pendiente", "pendiente"), ("Vencido", "vencido"),
                           ("Vence en 7 días", "vence_7_dias")):
        print(f"{etiqueta}: {euro(total[clave])}")
    print("\nDetalle:")
    for factura in facturas:
        print(f"{factura.numero} | {factura.cliente} | {estado(factura, args.fecha)} | saldo {euro(factura.saldo)}")
    if errores:
        print("\nFilas excluidas de los totales:")
        for error in errores:
            print(f"Fila {error.fila}: {error.motivo}")
    return 0 if not errores else 1


if __name__ == "__main__":
    raise SystemExit(main())
