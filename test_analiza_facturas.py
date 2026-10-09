import io
import unittest
from datetime import date
from decimal import Decimal

from analiza_facturas import estado, leer_facturas, resumen


class FacturasTest(unittest.TestCase):
    def test_cobro_parcial_vencimiento_y_proximos_siete_dias(self):
        csv = io.StringIO(
            "factura;cliente;emision;vencimiento;importe;cobrado\n"
            "F-1;Cliente A;2026-10-01;2026-10-06;1000,00;250,00\n"
            "F-2;Cliente B;2026-10-01;2026-10-12;500,00;0\n"
            "F-3;Cliente C;2026-10-01;2026-11-15;300,00;300,00\n"
        )
        facturas, errores = leer_facturas(csv)
        self.assertEqual(errores, [])
        corte = date(2026, 10, 9)
        self.assertEqual([estado(f, corte) for f in facturas], ["vencida", "vence en 7 días", "cobrada"])
        self.assertEqual(resumen(facturas, corte), {
            "emitido": Decimal("1800"), "cobrado": Decimal("550"),
            "pendiente": Decimal("1250"), "vencido": Decimal("750"),
            "vence_7_dias": Decimal("500"),
        })

    def test_excluye_incompletos_duplicados_importes_y_fechas_invalidos(self):
        csv = io.StringIO(
            "factura;cliente;emision;vencimiento;importe;cobrado\n"
            "F-1;A;2026-10-01;2026-10-02;100;0\n"
            "f-1;B;2026-10-01;2026-10-02;100;0\n"
            "F-2;C;2026-10-01;2026-10-02;100;101\n"
            "F-3;D;2026-10-03;2026-10-02;100;0\n"
            "F-4;E;2026-10-01;2026-10-02;-1;0\n"
            "F-5;F;2026-10-01;2026-10-02;100;\n"
        )
        facturas, errores = leer_facturas(csv)
        self.assertEqual(len(facturas), 1)
        self.assertEqual(len(errores), 5)
        self.assertEqual(resumen(facturas, date(2026, 10, 9))["pendiente"], Decimal("100"))

    def test_empty_and_header_validation(self):
        facturas, errores = leer_facturas(io.StringIO("factura;cliente;emision;vencimiento;importe;cobrado\n"))
        self.assertEqual((facturas, errores), ([], []))
        with self.assertRaises(ValueError):
            leer_facturas(io.StringIO("factura;cliente\nF-1;A\n"))

    def test_comma_separated_csv_and_unquoted_decimal_commas(self):
        correcto = io.StringIO(
            "factura,cliente,emision,vencimiento,importe,cobrado\n"
            "F-1,A,2026-10-01,2026-10-09,100.50,0\n"
        )
        facturas, errores = leer_facturas(correcto)
        self.assertEqual(errores, [])
        self.assertEqual(facturas[0].saldo, Decimal("100.50"))
        incorrecto = io.StringIO(
            "factura,cliente,emision,vencimiento,importe,cobrado\n"
            "F-1,A,2026-10-01,2026-10-09,100,50,0\n"
        )
        facturas, errores = leer_facturas(incorrecto)
        self.assertEqual(facturas, [])
        self.assertEqual(len(errores), 1)


if __name__ == "__main__":
    unittest.main()
