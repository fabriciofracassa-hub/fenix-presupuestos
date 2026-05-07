import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPresupuestos, deletePresupuesto } from "../lib/firestore";
import { formatARS } from "../lib/calculos";

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const navigate = useNavigate();

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const data = await getPresupuestos();
    setPresupuestos(data);
    setLoading(false);
  }

  async function eliminar(id, e) {
    e.stopPropagation();
    if (!confirm("¿Eliminar este presupuesto?")) return;
    await deletePresupuesto(id);
    cargar();
  }

  function formatFecha(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"numeric" });
  }

  const filtrados = presupuestos.filter(p =>
    p.cliente?.toLowerCase().includes(buscar.toLowerCase()) ||
    p.tipoTrabajo?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2>Presupuestos</h2>
          <p style={{ color:"var(--gris)", fontSize:"0.85rem", marginTop:4 }}>
            {presupuestos.length} presupuesto{presupuestos.length !== 1 ? "s" : ""} guardado{presupuestos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/nuevo")}>+ Nuevo presupuesto</button>
      </div>

      <div style={{ marginBottom:16 }}>
        <input
          placeholder="Buscar por cliente o tipo de trabajo..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          style={{ maxWidth:360 }}
        />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"/><span>Cargando...</span></div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize:"2rem" }}>📋</p>
          <p>{buscar ? "Sin resultados para esa búsqueda" : "Todavía no hay presupuestos. ¡Creá el primero!"}</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtrados.map(p => (
            <div
              key={p.id}
              className="card"
              style={{ cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}
              onClick={() => navigate(`/presupuesto/${p.id}`)}
            >
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:"1rem" }}>{p.cliente || "Sin nombre"}</span>
                  <span className={`badge ${p.estado === "enviado" ? "badge-green" : "badge-gray"}`}>
                    {p.estado === "enviado" ? "Enviado" : "Borrador"}
                  </span>
                </div>
                <p style={{ color:"var(--gris)", fontSize:"0.8rem" }}>
                  {p.tipoTrabajo || "Sin tipo"} · {formatFecha(p.creadoEn)}
                </p>
              </div>

              <div style={{ textAlign:"right" }}>
                <p style={{ color:"var(--naranja)", fontWeight:800, fontSize:"1.2rem" }}>
                  {formatARS(p.resumen?.precioVenta || 0)}
                </p>
                <p style={{ color:"var(--gris)", fontSize:"0.75rem" }}>
                  Costo: {formatARS(p.resumen?.totalCostos || 0)}
                </p>
              </div>

              <div style={{ display:"flex", gap:6 }} onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-icon"
                  title="Ver presupuesto"
                  onClick={() => navigate(`/presupuesto/${p.id}`)}
                >👁️</button>
                <button
                  className="btn btn-ghost btn-icon"
                  title="Editar"
                  onClick={() => navigate(`/editar/${p.id}`)}
                >✏️</button>
                <button
                  className="btn btn-ghost btn-icon"
                  title="Eliminar"
                  onClick={e => eliminar(p.id, e)}
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
