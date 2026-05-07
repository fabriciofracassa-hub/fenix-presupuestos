import { useState, useEffect } from "react";
import { getOperarios, addOperario, updateOperario, deleteOperario } from "../lib/firestore";
import { diasDesdeActualizacion, formatARS } from "../lib/calculos";

const EMPTY = { nombre: "", rol: "", tarifaHora: "" };

export default function Operarios() {
  const [operarios, setOperarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const data = await getOperarios();
    setOperarios(data);
    setLoading(false);
  }

  function abrirNuevo() { setForm(EMPTY); setEditId(null); setModal(true); }
  function abrirEditar(o) {
    setForm({ nombre: o.nombre, rol: o.rol, tarifaHora: o.tarifaHora });
    setEditId(o.id);
    setModal(true);
  }

  async function guardar() {
    if (!form.nombre || !form.tarifaHora) return alert("Nombre y tarifa son obligatorios");
    setSaving(true);
    const data = {
      nombre: form.nombre.trim(),
      rol: form.rol.trim(),
      tarifaHora: parseFloat(form.tarifaHora) || 0,
    };
    if (editId) await updateOperario(editId, data);
    else await addOperario(data);
    setSaving(false);
    setModal(false);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este operario?")) return;
    await deleteOperario(id);
    cargar();
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2>Operarios</h2>
          <p style={{ color:"var(--gris)", fontSize:"0.85rem", marginTop:4 }}>
            {operarios.length} operarios registrados
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Agregar</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"/><span>Cargando...</span></div>
      ) : operarios.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize:"2rem" }}>👷</p>
          <p>No hay operarios. Agregá el primero.</p>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Tarifa / hora</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {operarios.map(o => {
                const dias = diasDesdeActualizacion(o.updatedAt);
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight:600 }}>{o.nombre}</td>
                    <td><span className="badge badge-gray">{o.rol || "—"}</span></td>
                    <td style={{ color:"var(--naranja)", fontWeight:700 }}>{formatARS(o.tarifaHora)}/h</td>
                    <td>
                      {dias !== null && (
                        <span className={`badge ${dias > 30 ? "badge-warning" : "badge-green"}`}>
                          {dias === 0 ? "Hoy" : `Hace ${dias}d`}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => abrirEditar(o)}>✏️</button>
                        <button className="btn btn-ghost btn-icon" onClick={() => eliminar(o.id)}>🗑️</button>
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
              <h3>{editId ? "Editar operario" : "Nuevo operario"}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Fabricio Fracassa" />
            </div>
            <div className="form-group">
              <label>Rol / especialidad</label>
              <input value={form.rol} onChange={e => setForm(f=>({...f,rol:e.target.value}))} placeholder="Ej: Operador láser" />
            </div>
            <div className="form-group">
              <label>Tarifa por hora ($)</label>
              <input type="number" value={form.tarifaHora} onChange={e => setForm(f=>({...f,tarifaHora:e.target.value}))} placeholder="0" />
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
