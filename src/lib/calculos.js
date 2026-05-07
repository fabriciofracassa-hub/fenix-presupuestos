// ── calculos.js ─────────────────────────────────────────────
// Todas las fórmulas del presupuesto centralizadas y testeables

// ── MATERIALES ──────────────────────────────────────────────

/**
 * Costo de un material por ÁREA
 * @param {object} material - { costo, ancho, alto } (placa completa en cm)
 * @param {number} anchoProducto - ancho del producto en cm
 * @param {number} altoProducto - alto del producto en cm
 * @param {number} cantidad - cantidad de piezas
 */
export function costoMaterialPorArea(material, anchoProducto, altoProducto, cantidad) {
  const areaPlaca = material.ancho * material.alto;
  if (areaPlaca <= 0) return 0;
  const areaProducto = anchoProducto * altoProducto;
  const areaTotal = areaProducto * cantidad;
  const costoPorCm2 = material.costo / areaPlaca;
  return areaTotal * costoPorCm2;
}

/**
 * Costo de un material por UNIDAD
 */
export function costoMaterialPorUnidad(material, cantidad) {
  return material.costo * cantidad;
}

export function calcularCostoMaterial(material, anchoProducto, altoProducto, cantidad) {
  if (material.tipo === "area") {
    return costoMaterialPorArea(material, anchoProducto, altoProducto, cantidad);
  }
  return costoMaterialPorUnidad(material, cantidad);
}

// ── OPERARIOS ───────────────────────────────────────────────

/**
 * Costo de mano de obra
 */
export function costoOperario(operario, horas) {
  return operario.tarifaHora * horas;
}

// ── MÁQUINAS ────────────────────────────────────────────────

/**
 * Amortización de la máquina por HORAS usadas
 * costo / vidaUtilHoras * horasUsadas
 */
export function amortizacionMaquinaPorHoras(maquina, horasUsadas) {
  if (maquina.vidaUtilHoras <= 0) return 0;
  return (maquina.costo / maquina.vidaUtilHoras) * horasUsadas;
}

/**
 * Amortización de la máquina por COPIAS
 * costo / vidaUtilCopias * copiasUsadas
 */
export function amortizacionMaquinaPorCopias(maquina, copiasUsadas) {
  if (maquina.vidaUtilCopias <= 0) return 0;
  return (maquina.costo / maquina.vidaUtilCopias) * copiasUsadas;
}

/**
 * Amortización de un consumible por HORAS
 */
export function amortizacionConsumiblePorHoras(consumible, horasUsadas) {
  if (consumible.vidaUtil <= 0) return 0;
  return (consumible.costo / consumible.vidaUtil) * horasUsadas;
}

/**
 * Amortización de un consumible por COPIAS
 */
export function amortizacionConsumiblePorCopias(consumible, copiasUsadas) {
  if (consumible.vidaUtil <= 0) return 0;
  return (consumible.costo / consumible.vidaUtil) * copiasUsadas;
}

/**
 * Costo total de una máquina incluyendo todos sus consumibles
 * @param {object} maquina - datos de la máquina
 * @param {number} horasUsadas
 * @param {number} copiasUsadas
 */
export function costoTotalMaquina(maquina, horasUsadas, copiasUsadas) {
  let total = 0;

  // Amortización del equipo
  if (maquina.calculoPor === "horas") {
    total += amortizacionMaquinaPorHoras(maquina, horasUsadas);
  } else {
    total += amortizacionMaquinaPorCopias(maquina, copiasUsadas);
  }

  // Consumibles
  if (maquina.consumibles && maquina.consumibles.length > 0) {
    maquina.consumibles.forEach(c => {
      if (c.calculoPor === "horas") {
        total += amortizacionConsumiblePorHoras(c, horasUsadas);
      } else {
        total += amortizacionConsumiblePorCopias(c, copiasUsadas);
      }
    });
  }

  return total;
}

// ── COSTOS FIJOS ────────────────────────────────────────────

/**
 * Prorrateo de costos fijos mensuales según horas del trabajo
 * Fórmula correcta: (total_fijos / horas_productivas_mes) * horas_trabajo
 * @param {object} costosFijos - { luz, gas, internet, alquiler, afip, otros, horasProductivasMes }
 * @param {number} horasTrabajo - horas que demanda este trabajo puntual
 */
export function costoFijosProrrateados(costosFijos, horasTrabajo) {
  const totalFijos =
    (costosFijos.luz || 0) +
    (costosFijos.gas || 0) +
    (costosFijos.internet || 0) +
    (costosFijos.alquiler || 0) +
    (costosFijos.afip || 0) +
    (costosFijos.otros || 0);

  const horasMes = costosFijos.horasProductivasMes || 120;
  if (horasMes <= 0) return 0;

  return (totalFijos / horasMes) * horasTrabajo;
}

// ── RESUMEN TOTAL ────────────────────────────────────────────

/**
 * Calcula el resumen completo del presupuesto
 * @param {object} items - { materiales[], operarios[], maquinas[], costosFijos, horasTotales }
 * @param {number} margenGanancia - porcentaje (ej: 30 para 30%)
 */
export function calcularResumen(items, margenGanancia = 0) {
  const totalMateriales = items.materiales.reduce((acc, m) => acc + m.costoTotal, 0);
  const totalOperarios = items.operarios.reduce((acc, o) => acc + o.costoTotal, 0);
  const totalMaquinas = items.maquinas.reduce((acc, m) => acc + m.costoTotal, 0);
  const totalFijos = costoFijosProrrateados(items.costosFijos, items.horasTotales);

  const totalCostos = totalMateriales + totalOperarios + totalMaquinas + totalFijos;
  const precioVenta = totalCostos * (1 + margenGanancia / 100);

  return {
    totalMateriales,
    totalOperarios,
    totalMaquinas,
    totalFijos,
    totalCostos,
    margenGanancia,
    precioVenta
  };
}

// ── HELPERS ──────────────────────────────────────────────────

export function formatARS(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

export function diasDesdeActualizacion(timestamp) {
  if (!timestamp) return null;
  const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const ahora = new Date();
  const diff = ahora - fecha;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
