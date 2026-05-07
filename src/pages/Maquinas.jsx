import { useState, useEffect } from "react";
import { getMaquinas, addMaquina, updateMaquina, deleteMaquina } from "../lib/firestore";
import { diasDesdeActualizacion, formatARS } from "../lib/calculos";

const EMPTY_MAQUINA = { nombre: "", costo: "", calculoPor: "horas", vidaUtilHoras: "", vidaUtilCopias: "", copiasPorMinuto: "", consumibles: [] };
const EMPTY_CONSUMIBLE = { nombre: "", costo: "", vidaUtil: "", calculoPor: "horas" };

export default function Maquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_MAQUINA);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandida, setExpandida] = useState(null);
  const [modalConsumible, setModalConsumible] = useState(false);
  const [formConsumible, setFormConsumible] = useState(EMPTY_CONSUMIBLE);
  const [editConsumibleIdx, setEditConsumibleIdx] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const data = await getMaquinas();
    setMaquinas(data);
    setLoading(false);
  }

  function abrirNueva() { setForm(EMPTY_MAQUINA); setEditId(null); setModal(true); }
  function abrirEditar(m) {
    setForm({
      nombre: m.nombre, costo: m.costo, calculoPor: m.calculoPor,
      vidaUtilHoras: m.vidaUtilHoras || "", vidaUtilCopias: m.vidaUtilCopias || "",
      copiasPorMinuto: m.copiasPorMinuto || "",
      consumibles: m.consumibles || []
    });
    setEditId(m.id);
    setModal(true);
  }

  async function guardar() {
    if (!form.nombre || !form.costo) return alert("Nombre y costo son obligatorios");
    setSaving(true);
    const data = {
      nombre: form.nombre.trim(),
      costo: parseFloat(form.costo) || 0,
      calculoPor: form.calculoPor,
      vidaUtilHoras: parseFloat(form.vidaUtilHoras) || 0,
      vidaUtilCopias: parseFloat(form.vidaUtilCopias) || 0,
      copiasPorMinuto: parseFloat(form.copiasPorMinuto) || 0,
      consumibles: form.consumibles,
    };
    if (editId) await updateMaquina(editId, data);
    else await addMaquina(data);
    setSaving(false);
    setModal(false);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar esta máquina?")) return;
    await deleteMaquina(id);
    cargar();
  }

  // ── Consumibles dentro del form ──
  function abrirNuevoConsumible() {
    setFormConsumible(EMPTY_CONSUMIBLE);
    setEditConsumibleIdx(null);
    setModalConsumible(true);
  }
  function abrirEditarConsumible(idx) {
    setFormConsumible({ ...form.consumibles[idx] });
    setEditConsumibleIdx(idx);
    setModalConsumible(true);
  }
  function guardarConsumible() {
    if (!formConsumible.nombre || !formConsumible.costo) return alert("Nombre y costo son obligatorios");
    const c = {
      nombre: formConsumible.nombre.trim(),
      costo: parseFloat(formConsumible.costo) || 0,
      vidaUtil: parseFloat(formConsumible.vidaUtil) || 0,
      calculoPor: formConsumible.calculoPor,
    };
    const lista = [...form.consumibles];
    if (editConsumibleIdx !== null) lista[editConsumibleIdx] = c;
    else lista.push(c);
    setForm(f => ({ ...f, consumibles: lista }));
    setModalConsumible(false);
  }
  function eliminarConsumible(idx) {
    setForm(f => ({ ...f, consumibles: f.consumibles.filter((_, i) => i !== idx) }));
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2>Máquinas</h2>
          <p style={{ color:"var(--gris)", fontSize:"0.85rem", marginTop:4 }}>
            {maquinas.length} máquinas registradas
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNueva}>+ Agregar</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"/><span>Cargando...</span></div>
      ) : maquinas.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize:"2rem" }}>⚙️</p>
          <p>No hay máquinas. Agregá la primera.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {maquinas.map(m => {
            const dias = diasDesdeActualizacion(m.updatedAt);
            const abierta = expandida === m.id;
            return (
              <div key={m.id} className="card">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flex:1 }}>
                    <span style={{ fontSize:"1.5rem" }}>⚙️</span>
                    <div>
                      <p style={{ fontWeight:700, fontSize:"1rem" }}>{m.nombre}</p>
                      <div style={{ display:"flex", gap:8, marginTop:4, flexWrap:"wrap" }}>
                        <span className={`badge ${m.calculoPor === "horas" ? "badge-orange" : "badge-gray"}`}>
                          {m.calculoPor === "horas" ? "Por hora" : "Por copias"}
                        </span>
                        <span className="badge badge-gray">
                          Costo: {formatARS(m.costo)}
                        </span>
                        {m.calculoPor === "horas" && m.vidaUtilHoras > 0 && (
                          <span className="badge badge-gray">{m.vidaUtilHoras} hs vida útil</span>
                        )}
                        {m.calculoPor === "copias" && m.vidaUtilCopias > 0 && (
                          <span className="badge badge-gray">{m.vidaUtilCopias.toLocaleString()} copias vida útil</span>
                        )}
                        {dias !== null && (
                          <span className={`badge ${dias > 30 ? "badge-warning" : "badge-green"}`}>
                            {dias === 0 ? "Hoy" : `Hace ${dias}d`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {m.consumibles?.length > 0 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setExpandida(abierta ? null : m.id)}>
                        {abierta ? "▲" : `▼ ${m.consumibles.length} consumible${m.consumibles.length > 1 ? "s" : ""}`}
                      </button>
                    )}
                    <button className="btn btn-ghost btn-icon" onClick={() => abrirEditar(m)}>✏️</button>
                    <button className="btn btn-ghost btn-icon" onClick={() => eliminar(m.id)}>🗑️</button>
                  </div>
                </div>

                {abierta && m.consumibles?.length > 0 && (
                  <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                    <p style={{ fontSize:"0.75rem", color:"var(--naranja-dark)", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Consumibles</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Consumible</th>
                          <th>Costo</th>
                          <th>Vida útil</th>
                          <th>Calcula por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.consumibles.map((c, i) => (
                          <tr key={i}>
                            <td>{c.nombre}</td>
                            <td style={{ color:"var(--naranja)" }}>{formatARS(c.costo)}</td>
                            <td>{c.vidaUtil} {c.calculoPor === "horas" ? "hs" : "copias"}</td>
                            <td><span className="badge badge-gray">{c.calculoPor}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Máquina ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box" style={{ maxWidth:600 }}>
            <div className="modal-header">
              <h3>{editId ? "Editar máquina" : "Nueva máquina"}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Nombre de la máquina</label>
              <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Láser CO₂ 60W" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Costo del equipo ($)</label>
                <input type="number" value={form.costo} onChange={e => setForm(f=>({...f,costo:e.target.value}))} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Amortización por</label>
                <select value={form.calculoPor} onChange={e => setForm(f=>({...f,calculoPor:e.target.value}))}>
                  <option value="horas">Horas de uso</option>
                  <option value="copias">Copias / trabajos</option>
                </select>
              </div>
            </div>

            {form.calculoPor === "horas" ? (
              <div className="form-group">
                <label>Vida útil estimada (horas)</label>
                <input type="number" value={form.vidaUtilHoras} onChange={e => setForm(f=>({...f,vidaUtilHoras:e.target.value}))} placeholder="Ej: 10000" />
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>Vida útil (copias)</label>
                  <input type="number" value={form.vidaUtilCopias} onChange={e => setForm(f=>({...f,vidaUtilCopias:e.target.value}))} placeholder="Ej: 50000" />
                </div>
                <div className="form-group">
                  <label>Copias por minuto</label>
                  <input type="number" value={form.copiasPorMinuto} onChange={e => setForm(f=>({...f,copiasPorMinuto:e.target.value}))} placeholder="Ej: 3" />
                </div>
              </div>
            )}

            {/* Consumibles */}
            <div className="divider" />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <h3>Consumibles</h3>
              <button className="btn btn-secondary btn-sm" onClick={abrirNuevoConsumible}>+ Agregar consumible</button>
            </div>

            {form.consumibles.length === 0 ? (
              <p style={{ color:"var(--gris)", fontSize:"0.85rem", marginBottom:12 }}>Sin consumibles cargados</p>
            ) : (
              <div style={{ marginBottom:12 }}>
                {form.consumibles.map((c, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"var(--bg-card2)", borderRadius:"var(--radius)", marginBottom:6 }}>
                    <div>
                      <span style={{ fontWeight:600, fontSize:"0.875rem" }}>{c.nombre}</span>
                      <span style={{ color:"var(--gris)", fontSize:"0.8rem", marginLeft:10 }}>{formatARS(c.costo)} · {c.vidaUtil} {c.calculoPor === "horas" ? "hs" : "copias"}</span>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => abrirEditarConsumible(i)}>✏️</button>
                      <button className="btn btn-ghost btn-icon" onClick={() => eliminarConsumible(i)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={saving}>
                {saving ? "Guardando..." : "Guardar máquina"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Consumible ── */}
      {modalConsumible && (
        <div className="modal-overlay" style={{ zIndex:1100 }} onClick={e => e.target === e.currentTarget && setModalConsumible(false)}>
          <div className="modal-box" style={{ maxWidth:400 }}>
            <div className="modal-header">
              <h3>{editConsumibleIdx !== null ? "Editar consumible" : "Nuevo consumible"}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalConsumible(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input value={formConsumible.nombre} onChange={e => setFormConsumible(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Tubo láser" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Costo ($)</label>
                <input type="number" value={formConsumible.costo} onChange={e => setFormConsumible(f=>({...f,costo:e.target.value}))} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Amortización por</label>
                <select value={formConsumible.calculoPor} onChange={e => setFormConsumible(f=>({...f,calculoPor:e.target.value}))}>
                  <option value="horas">Horas</option>
                  <option value="copias">Copias</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Vida útil ({formConsumible.calculoPor === "horas" ? "horas" : "copias"})</label>
              <input type="number" value={formConsumible.vidaUtil} onChange={e => setFormConsumible(f=>({...f,vidaUtil:e.target.value}))} placeholder="0" />
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
              <button className="btn btn-secondary" onClick={() => setModalConsumible(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarConsumible}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
