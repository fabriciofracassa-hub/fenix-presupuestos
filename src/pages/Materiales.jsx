import { useState, useEffect } from "react";
import { getMateriales, addMaterial, updateMaterial, deleteMaterial } from "../lib/firestore";
import { diasDesdeActualizacion, formatARS } from "../lib/calculos";

const EMPTY = { nombre: "", costo: "", tipo: "area", ancho: "", alto: "", espesor: "", gramaje: "" };

export default function Materiales() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [buscar, setBuscar] = useState("");

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const data = await getMateriales();
    setMateriales(data);
    setLoading(false);
  }

  function abrirNuevo() { setForm(EMPTY); setEditId(null); setModal(true); }
  function abrirEditar(m) {
    setForm({ nombre: m.nombre, costo: m.costo, tipo: m.tipo,
      ancho: m.ancho || "", alto: m.alto || "",
      espesor: m.espesor || "", gramaje: m.gramaje || "" });
    setEditId(m.id);
    setModal(true);
  }

  async function guardar() {
    if (!form.nombre || !form.costo) return alert("Nombre y costo son obligatorios");
    setSaving(true);
    const data = {
      nombre: form.nombre.trim(),
      costo: parseFloat(form.costo) || 0,
      tipo: form.tipo,
      ancho: parseFloat(form.ancho) || 0,
      alto: parseFloat(form.alto) || 0,
      espesor: parseFloat(form.espesor) || 0,
      gramaje: parseFloat(form.gramaje) || 0,
    };
    if (editId) await updateMaterial(editId, data);
    else await addMaterial(data);
    setSaving(false);
    setModal(false);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este material?")) return;
    await deleteMaterial(id);
    cargar();
  }

  const filtrados = materiales.filter(m =>
    m.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2>Materiales</h2>
          <p style={{ color:"var(--gris)", fontSize:"0.85rem", marginTop:4 }}>
            {materiales.length} materiales registrados
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Agregar</button>
      </div>

      <div style={{ marginBottom:16 }}>
        <input
          placeholder="Buscar material..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          style={{ maxWidth:300 }}
        />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"/><span>Cargando...</span></div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize:"2rem" }}>🪵</p>
          <p>No hay materiales. Agregá el primero.</p>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Tipo</th>
                <th>Costo</th>
                <th>Dimensiones</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(m => {
                const dias = diasDesdeActualizacion(m.updatedAt);
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight:600 }}>{m.nombre}</td>
                    <td>
                      <span className={`badge ${m.tipo === "area" ? "badge-orange" : "badge-gray"}`}>
                        {m.tipo === "area" ? "Por área" : "Por unidad"}
                      </span>
                    </td>
                    <td style={{ color:"var(--naranja)", fontWeight:700 }}>{formatARS(m.costo)}</td>
                    <td style={{ color:"var(--gris)", fontSize:"0.8rem" }}>
                      {m.tipo === "area" ? `${m.ancho}×${m.alto} cm` : "—"}
                    </td>
                    <td>
                      {dias !== null && (
                        <span className={`badge ${dias > 30 ? "badge-warning" : "badge-green"}`}>
                          {dias === 0 ? "Hoy" : `Hace ${dias}d`}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => abrirEditar(m)} title="Editar">✏️</button>
                        <button className="btn btn-ghost btn-icon" onClick={() => eliminar(m.id)} title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editId ? "Editar material" : "Nuevo material"}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Acrílico 3mm transparente" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Costo ($)</label>
                <input type="number" value={form.costo} onChange={e => setForm(f=>({...f,costo:e.target.value}))} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Tipo de cálculo</label>
                <select value={form.tipo} onChange={e => setForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="area">Por área (placa/rollo)</option>
                  <option value="unidad">Por unidad</option>
                </select>
              </div>
            </div>

            {form.tipo === "area" && (
              <div className="form-row-3">
                <div className="form-group">
                  <label>Ancho (cm)</label>
                  <input type="number" value={form.ancho} onChange={e => setForm(f=>({...f,ancho:e.target.value}))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Alto (cm)</label>
                  <input type="number" value={form.alto} onChange={e => setForm(f=>({...f,alto:e.target.value}))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Espesor (mm)</label>
                  <input type="number" value={form.espesor} onChange={e => setForm(f=>({...f,espesor:e.target.value}))} placeholder="0" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Gramaje (g/m² — opcional)</label>
              <input type="number" value={form.gramaje} onChange={e => setForm(f=>({...f,gramaje:e.target.value}))} placeholder="0" />
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
