import { useState, useEffect } from "react";
import { getCostosFijos, saveCostosFijos } from "../lib/firestore";
import { formatARS } from "../lib/calculos";

const CAMPOS = [
  { key: "luz",       label: "Electricidad",  icon: "💡" },
  { key: "gas",       label: "Gas",           icon: "🔥" },
  { key: "internet",  label: "Internet",      icon: "🌐" },
  { key: "alquiler",  label: "Alquiler",      icon: "🏠" },
  { key: "afip",      label: "AFIP / Monotributo", icon: "📄" },
  { key: "otros",     label: "Otros",         icon: "📦" },
];

export default function CostosFijos() {
  const [form, setForm] = useState({
    luz: "", gas: "", internet: "", alquiler: "", afip: "", otros: "",
    horasProductivasMes: 120
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const data = await getCostosFijos();
    setForm({
      luz: data.luz || 0,
      gas: data.gas || 0,
      internet: data.internet || 0,
      alquiler: data.alquiler || 0,
      afip: data.afip || 0,
      otros: data.otros || 0,
      horasProductivasMes: data.horasProductivasMes || 120,
    });
    setLoading(false);
  }

  async function guardar() {
    setSaving(true);
    await saveCostosFijos({
      luz: parseFloat(form.luz) || 0,
      gas: parseFloat(form.gas) || 0,
      internet: parseFloat(form.internet) || 0,
      alquiler: parseFloat(form.alquiler) || 0,
      afip: parseFloat(form.afip) || 0,
      otros: parseFloat(form.otros) || 0,
      horasProductivasMes: parseFloat(form.horasProductivasMes) || 120,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const totalMensual = CAMPOS.reduce((acc, c) => acc + (parseFloat(form[c.key]) || 0), 0);
  const costoPorHora = totalMensual / (parseFloat(form.horasProductivasMes) || 120);

  if (loading) return <div className="loading"><div className="spinner"/></div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Costos fijos mensuales</h2>
        <p style={{ color:"var(--gris)", fontSize:"0.85rem", marginTop:4 }}>
          Estos costos se prorratean automáticamente en cada presupuesto según las horas del trabajo.
        </p>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <span style={{ fontSize:"1.2rem" }}>⏱️</span>
          <div>
            <p style={{ fontWeight:700, fontSize:"0.875rem" }}>Horas productivas por mes</p>
            <p style={{ color:"var(--gris)", fontSize:"0.8rem" }}>¿Cuántas horas trabajás en promedio por mes?</p>
          </div>
        </div>
        <input
          type="number"
          value={form.horasProductivasMes}
          onChange={e => setForm(f => ({ ...f, horasProductivasMes: e.target.value }))}
          style={{ maxWidth:160 }}
        />
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        {CAMPOS.map(({ key, label, icon }) => (
          <div key={key} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <span style={{ fontSize:"1.2rem", width:28, textAlign:"center" }}>{icon}</span>
            <div style={{ flex:1 }}>
              <label style={{ marginBottom:2 }}>{label}</label>
              <input
                type="number"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="card" style={{ background:"var(--bg-card2)", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ color:"var(--gris)", fontSize:"0.875rem" }}>Total mensual</span>
          <span style={{ color:"var(--naranja)", fontWeight:700, fontSize:"1.1rem" }}>{formatARS(totalMensual)}</span>
        </div>
        <div className="divider" style={{ margin:"12px 0" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"var(--gris)", fontSize:"0.875rem" }}>Costo fijo por hora de trabajo</span>
          <span style={{ color:"var(--blanco)", fontWeight:700, fontSize:"1.1rem" }}>{formatARS(costoPorHora)}</span>
        </div>
        <p style={{ color:"var(--gris)", fontSize:"0.75rem", marginTop:8 }}>
          = {formatARS(totalMensual)} ÷ {form.horasProductivasMes} hs
        </p>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom:12 }}>
          ✅ Costos fijos guardados correctamente
        </div>
      )}

      <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ width:"100%" }}>
        {saving ? "Guardando..." : "Guardar costos fijos"}
      </button>
    </div>
  );
}
