import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMateriales, getOperarios, getMaquinas, getCostosFijos, addPresupuesto, updatePresupuesto, getPresupuesto } from "../lib/firestore";
import { calcularCostoMaterial, costoOperario, costoTotalMaquina, calcularResumen, formatARS } from "../lib/calculos";

export default function NuevoPresupuesto({ editId = null }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);

  // Catálogos
  const [catMateriales, setCatMateriales] = useState([]);
  const [catOperarios, setCatOperarios] = useState([]);
  const [catMaquinas, setCatMaquinas] = useState([]);
  const [costosFijos, setCostosFijos] = useState({});
  const [loading, setLoading] = useState(true);

  // Datos del presupuesto
  const [cliente, setCliente] = useState("");
  const [tipoTrabajo, setTipoTrabajo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [margen, setMargen] = useState(30);

  // Items agregados
  const [itemsMateriales, setItemsMateriales] = useState([]);
  const [itemsOperarios, setItemsOperarios]   = useState([]);
  const [itemsMaquinas, setItemsMaquinas]     = useState([]);

  // Selecciones temporales
  const [selMat, setSelMat] = useState({ materialId:"", ancho:"", alto:"", cantidad:"1" });
  const [selOp,  setSelOp]  = useState({ operarioId:"", horas:"" });
  const [selMaq, setSelMaq] = useState({ maquinaId:"", horas:"", copias:"" });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const [mats, ops, maqs, cf] = await Promise.all([
        getMateriales(), getOperarios(), getMaquinas(), getCostosFijos()
      ]);
      setCatMateriales(mats);
      setCatOperarios(ops);
      setCatMaquinas(maqs);
      setCostosFijos(cf);

      if (editId) {
        const p = await getPresupuesto(editId);
        if (p) {
          setCliente(p.cliente || "");
          setTipoTrabajo(p.tipoTrabajo || "");
          setDescripcion(p.descripcion || "");
          setMargen(p.margen || 30);
          setItemsMateriales(p.itemsMateriales || []);
          setItemsOperarios(p.itemsOperarios || []);
          setItemsMaquinas(p.itemsMaquinas || []);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Agregar Material ──
  function agregarMaterial() {
    const mat = catMateriales.find(m => m.id === selMat.materialId);
    if (!mat || !selMat.cantidad) return alert("Seleccioná un material y cantidad");
    const cantidad = parseFloat(selMat.cantidad) || 1;
    const ancho = parseFloat(selMat.ancho) || 0;
    const alto  = parseFloat(selMat.alto)  || 0;
    if (mat.tipo === "area" && (!ancho || !alto)) return alert("Ingresá ancho y alto del producto");
    const costoTotal = calcularCostoMaterial(mat, ancho, alto, cantidad);
    setItemsMateriales(prev => [...prev, {
      nombre: mat.nombre, tipo: mat.tipo,
      cantidad, ancho, alto, costoTotal,
      snapshot: { costo: mat.costo, ancho: mat.ancho, alto: mat.alto }
    }]);
    setSelMat({ materialId:"", ancho:"", alto:"", cantidad:"1" });
  }

  // ── Agregar Operario ──
  function agregarOperario() {
    const op = catOperarios.find(o => o.id === selOp.operarioId);
    if (!op || !selOp.horas) return alert("Seleccioná un operario e ingresá las horas");
    const horas = parseFloat(selOp.horas) || 0;
    const costoTotal = costoOperario(op, horas);
    setItemsOperarios(prev => [...prev, {
      nombre: op.nombre, rol: op.rol, horas, costoTotal,
      snapshot: { tarifaHora: op.tarifaHora }
    }]);
    setSelOp({ operarioId:"", horas:"" });
  }

  // ── Agregar Máquina ──
  function agregarMaquina() {
    const maq = catMaquinas.find(m => m.id === selMaq.maquinaId);
    if (!maq) return alert("Seleccioná una máquina");
    const horas  = parseFloat(selMaq.horas)  || 0;
    const copias = parseFloat(selMaq.copias) || 0;
    if (maq.calculoPor === "horas" && !horas)   return alert("Ingresá las horas de uso");
    if (maq.calculoPor === "copias" && !copias)  return alert("Ingresá la cantidad de copias");
    const costoTotal = costoTotalMaquina(maq, horas, copias);
    setItemsMaquinas(prev => [...prev, {
      nombre: maq.nombre, calculoPor: maq.calculoPor,
      horas, copias, costoTotal,
      consumiblesCount: maq.consumibles?.length || 0
    }]);
    setSelMaq({ maquinaId:"", horas:"", copias:"" });
  }

  // ── Horas totales para prorrateo ──
  const horasTotales = itemsOperarios.reduce((a, o) => a + o.horas, 0) ||
                       itemsMaquinas.reduce((a, m) => a + m.horas, 0) || 0;

  const resumen = calcularResumen(
    { materiales: itemsMateriales, operarios: itemsOperarios, maquinas: itemsMaquinas, costosFijos, horasTotales },
    margen
  );

  async function guardar() {
    if (!cliente.trim()) return alert("Ingresá el nombre del cliente");
    setSaving(true);
    const data = {
      cliente: cliente.trim(),
      tipoTrabajo: tipoTrabajo.trim(),
      descripcion: descripcion.trim(),
      margen: parseFloat(margen) || 0,
      itemsMateriales, itemsOperarios, itemsMaquinas,
      costosFijosSnapshot: costosFijos,
      horasTotales,
      resumen,
      estado: "borrador",
    };
    if (editId) {
      await updatePresupuesto(editId, data);
    } else {
      const ref = await addPresupuesto(data);
      navigate(`/presupuesto/${ref.id}`);
      setSaving(false);
      return;
    }
    setSaving(false);
    navigate(`/presupuesto/${editId}`);
  }

  if (loading) return <div className="loading"><div className="spinner"/><span>Cargando...</span></div>;

  const matSeleccionado = catMateriales.find(m => m.id === selMat.materialId);
  const maqSeleccionada = catMaquinas.find(m => m.id === selMaq.maquinaId);

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ marginBottom:24 }}>
        <h2>{editId ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>
      </div>

      {/* ── Paso 1: Datos del cliente ── */}
      <section className="card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:16 }}>1 · Datos del trabajo</h3>
        <div className="form-group">
          <label>Cliente</label>
          <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente o empresa" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo de trabajo</label>
            <input value={tipoTrabajo} onChange={e => setTipoTrabajo(e.target.value)} placeholder="Ej: Grabado láser mármol" />
          </div>
          <div className="form-group">
            <label>Margen de ganancia (%)</label>
            <input type="number" value={margen} onChange={e => setMargen(e.target.value)} placeholder="30" />
          </div>
        </div>
        <div className="form-group">
          <label>Descripción del trabajo</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Detallá el trabajo: dimensiones, materiales, técnica, cantidad..."
            style={{ resize:"vertical" }}
          />
        </div>
      </section>

      {/* ── Paso 2: Materiales ── */}
      <section className="card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:16 }}>2 · Materiales</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}>
          <div style={{ flex:2, minWidth:180 }}>
            <label>Material</label>
            <select value={selMat.materialId} onChange={e => setSelMat(f=>({...f,materialId:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {catMateriales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          {matSeleccionado?.tipo === "area" && (
            <>
              <div style={{ width:90 }}>
                <label>Ancho (cm)</label>
                <input type="number" value={selMat.ancho} onChange={e => setSelMat(f=>({...f,ancho:e.target.value}))} placeholder="0" />
              </div>
              <div style={{ width:90 }}>
                <label>Alto (cm)</label>
                <input type="number" value={selMat.alto} onChange={e => setSelMat(f=>({...f,alto:e.target.value}))} placeholder="0" />
              </div>
            </>
          )}
          <div style={{ width:100 }}>
            <label>Cantidad</label>
            <input type="number" value={selMat.cantidad} onChange={e => setSelMat(f=>({...f,cantidad:e.target.value}))} placeholder="1" />
          </div>
          <button className="btn btn-secondary" onClick={agregarMaterial} style={{ marginBottom:0 }}>+ Agregar</button>
        </div>

        {itemsMateriales.length > 0 && (
          <table>
            <thead><tr><th>Material</th><th>Dimensiones</th><th>Cant.</th><th>Costo</th><th></th></tr></thead>
            <tbody>
              {itemsMateriales.map((m, i) => (
                <tr key={i}>
                  <td>{m.nombre}</td>
                  <td style={{ color:"var(--gris)", fontSize:"0.8rem" }}>
                    {m.tipo === "area" ? `${m.ancho}×${m.alto} cm` : "—"}
                  </td>
                  <td>{m.cantidad}</td>
                  <td style={{ color:"var(--naranja)", fontWeight:700 }}>{formatARS(m.costoTotal)}</td>
                  <td><button className="btn btn-ghost btn-icon" onClick={() => setItemsMateriales(p=>p.filter((_,j)=>j!==i))}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {itemsMateriales.length > 0 && (
          <p style={{ textAlign:"right", marginTop:8, color:"var(--naranja)", fontWeight:700 }}>
            Subtotal: {formatARS(resumen.totalMateriales)}
          </p>
        )}
      </section>

      {/* ── Paso 3: Mano de obra ── */}
      <section className="card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:16 }}>3 · Mano de obra</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}>
          <div style={{ flex:2, minWidth:180 }}>
            <label>Operario</label>
            <select value={selOp.operarioId} onChange={e => setSelOp(f=>({...f,operarioId:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {catOperarios.map(o => <option key={o.id} value={o.id}>{o.nombre} — {formatARS(o.tarifaHora)}/h</option>)}
            </select>
          </div>
          <div style={{ width:120 }}>
            <label>Horas</label>
            <input type="number" value={selOp.horas} onChange={e => setSelOp(f=>({...f,horas:e.target.value}))} placeholder="0" />
          </div>
          <button className="btn btn-secondary" onClick={agregarOperario}>+ Agregar</button>
        </div>

        {itemsOperarios.length > 0 && (
          <table>
            <thead><tr><th>Operario</th><th>Rol</th><th>Horas</th><th>Costo</th><th></th></tr></thead>
            <tbody>
              {itemsOperarios.map((o, i) => (
                <tr key={i}>
                  <td>{o.nombre}</td>
                  <td><span className="badge badge-gray">{o.rol}</span></td>
                  <td>{o.horas} hs</td>
                  <td style={{ color:"var(--naranja)", fontWeight:700 }}>{formatARS(o.costoTotal)}</td>
                  <td><button className="btn btn-ghost btn-icon" onClick={() => setItemsOperarios(p=>p.filter((_,j)=>j!==i))}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {itemsOperarios.length > 0 && (
          <p style={{ textAlign:"right", marginTop:8, color:"var(--naranja)", fontWeight:700 }}>
            Subtotal: {formatARS(resumen.totalOperarios)}
          </p>
        )}
      </section>

      {/* ── Paso 4: Máquinas ── */}
      <section className="card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:16 }}>4 · Máquinas</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:12 }}>
          <div style={{ flex:2, minWidth:180 }}>
            <label>Máquina</label>
            <select value={selMaq.maquinaId} onChange={e => setSelMaq(f=>({...f,maquinaId:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {catMaquinas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          {maqSeleccionada?.calculoPor === "horas" && (
            <div style={{ width:120 }}>
              <label>Horas de uso</label>
              <input type="number" value={selMaq.horas} onChange={e => setSelMaq(f=>({...f,horas:e.target.value}))} placeholder="0" />
            </div>
          )}
          {maqSeleccionada?.calculoPor === "copias" && (
            <div style={{ width:120 }}>
              <label>Cantidad de copias</label>
              <input type="number" value={selMaq.copias} onChange={e => setSelMaq(f=>({...f,copias:e.target.value}))} placeholder="0" />
            </div>
          )}
          <button className="btn btn-secondary" onClick={agregarMaquina}>+ Agregar</button>
        </div>

        {itemsMaquinas.length > 0 && (
          <table>
            <thead><tr><th>Máquina</th><th>Uso</th><th>Consumibles</th><th>Costo total</th><th></th></tr></thead>
            <tbody>
              {itemsMaquinas.map((m, i) => (
                <tr key={i}>
                  <td>{m.nombre}</td>
                  <td style={{ color:"var(--gris)", fontSize:"0.8rem" }}>
                    {m.calculoPor === "horas" ? `${m.horas} hs` : `${m.copias} copias`}
                  </td>
                  <td>
                    {m.consumiblesCount > 0
                      ? <span className="badge badge-orange">{m.consumiblesCount} incluidos</span>
                      : <span className="badge badge-gray">Sin consumibles</span>}
                  </td>
                  <td style={{ color:"var(--naranja)", fontWeight:700 }}>{formatARS(m.costoTotal)}</td>
                  <td><button className="btn btn-ghost btn-icon" onClick={() => setItemsMaquinas(p=>p.filter((_,j)=>j!==i))}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {itemsMaquinas.length > 0 && (
          <p style={{ textAlign:"right", marginTop:8, color:"var(--naranja)", fontWeight:700 }}>
            Subtotal: {formatARS(resumen.totalMaquinas)}
          </p>
        )}
      </section>

      {/* ── Resumen ── */}
      <section className="card" style={{ marginBottom:24, background:"var(--bg-card2)" }}>
        <h3 style={{ marginBottom:16 }}>Resumen de costos</h3>
        {[
          { label:"Materiales",    val: resumen.totalMateriales },
          { label:"Mano de obra",  val: resumen.totalOperarios },
          { label:"Máquinas",      val: resumen.totalMaquinas },
          { label:`Costos fijos (${horasTotales} hs)`, val: resumen.totalFijos },
        ].map(({ label, val }) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ color:"var(--gris)", fontSize:"0.875rem" }}>{label}</span>
            <span style={{ fontWeight:600 }}>{formatARS(val)}</span>
          </div>
        ))}
        <div className="divider" />
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:"var(--gris)", fontSize:"0.875rem" }}>Costo total</span>
          <span style={{ fontWeight:700, fontSize:"1rem" }}>{formatARS(resumen.totalCostos)}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"var(--gris)", fontSize:"0.875rem" }}>Margen {margen}%</span>
          <span style={{ color:"var(--naranja)", fontWeight:800, fontSize:"1.4rem" }}>
            {formatARS(resumen.precioVenta)}
          </span>
        </div>
      </section>

      <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>Cancelar</button>
        <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ minWidth:160 }}>
          {saving ? "Guardando..." : "💾 Guardar presupuesto"}
        </button>
      </div>
    </div>
  );
}
