import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPresupuesto, updatePresupuesto } from "../lib/firestore";
import { formatARS } from "../lib/calculos";
import styles from "./VistaPresupuesto.module.css";

export default function VistaPresupuesto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPresupuesto(id).then(data => { setP(data); setLoading(false); });
  }, [id]);

  async function marcarEnviado() {
    await updatePresupuesto(id, { estado: "enviado" });
    setP(prev => ({ ...prev, estado: "enviado" }));
  }

  function imprimirPDF() {
    marcarEnviado();
    window.print();
  }

  function formatFecha(ts) {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("es-AR", { day:"2-digit", month:"long", year:"numeric" });
  }

  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!p) return <div className="empty-state"><p>Presupuesto no encontrado</p></div>;

  return (
    <>
      {/* ── Barra de acciones — se oculta al imprimir ── */}
      <div className={styles.actionBar}>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>← Volver</button>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/editar/${id}`)}>✏️ Editar</button>
          <button className="btn btn-naranja" onClick={imprimirPDF}>
            📄 Imprimir / PDF
          </button>
        </div>
      </div>

      {/* ── Documento ── */}
      <div className={styles.documento} id="presupuesto-doc">
        <div className={styles.bandaLateral}>
          <span className={styles.bandaTexto}>PRESUPUESTO</span>
        </div>

        <div className={styles.cuerpo}>
          <header className={styles.header}>
            <img src="/logo-fenix.svg" alt="Fénix Grafismo" className={styles.logo} />
            <div className={styles.headerRight}>
              <p className={styles.fecha}>{formatFecha(p.creadoEn)}</p>
              {p.estado === "enviado" && <span className={`badge badge-green ${styles.estadoBadge}`}>Enviado</span>}
            </div>
          </header>

          <div className={styles.divider} />

          <div className={styles.clienteSection}>
            <div>
              <p className={styles.clienteLabel}>Presupuesto para</p>
              <p className={styles.clienteNombre}>{p.cliente}</p>
              {p.tipoTrabajo && <p className={styles.tipoTrabajo}>{p.tipoTrabajo}</p>}
            </div>
            <div className={styles.precioBox}>
              <p className={styles.precioLabel}>Total</p>
              <p className={styles.precioValor}>{formatARS(p.resumen?.precioVenta || 0)}</p>
            </div>
          </div>

          {p.descripcion && (
            <div className={styles.descripcionSection}>
              <p className={styles.sectionTitle}>Descripción del trabajo</p>
              <div className={styles.descripcionTexto}>
                {p.descripcion.split("\n").map((linea, i) => (
                  linea.trim() && <p key={i}>{linea}</p>
                ))}
              </div>
            </div>
          )}

          {p.resumen && (
            <div className={styles.totalClienteBox}>
              <div className={styles.totalFinal}>
                <span>TOTAL</span>
                <span>{formatARS(p.resumen.precioVenta)}</span>
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <div className={styles.footerContacto}>
              <span className={styles.footerItem}>
                <svg viewBox="0 0 24 24" className={styles.footerIcon} fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                2984 357740
              </span>
              <span className={styles.footerItem}>
                <svg viewBox="0 0 24 24" className={styles.footerIcon} fill="url(#igGrad)">
                  <defs>
                    <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="25%" stopColor="#e6683c"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="75%" stopColor="#cc2366"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @fenixgrafismo
              </span>
              <span className={styles.footerItem}>
                <svg viewBox="0 0 24 24" className={styles.footerIcon} fill="#ff9610"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                General Roca, Río Negro
              </span>
            </div>
            <p className={styles.footerNota}>
              Este presupuesto tiene validez de 7 días hábiles desde su emisión.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
