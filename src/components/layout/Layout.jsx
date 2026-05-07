import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

// SVG icons para el nav
const Icons = {
  presupuestos: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  nuevo:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  materiales:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  maquinas:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  operarios:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  costos:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

const NAV = [
  { to: "/",           icon: Icons.presupuestos, label: "Presupuestos" },
  { to: "/nuevo",      icon: Icons.nuevo,        label: "Nuevo presupuesto" },
  { to: "/materiales", icon: Icons.materiales,   label: "Materiales" },
  { to: "/maquinas",   icon: Icons.maquinas,     label: "Máquinas" },
  { to: "/operarios",  icon: Icons.operarios,    label: "Operarios" },
  { to: "/costos",     icon: Icons.costos,       label: "Costos fijos" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      {/* Mobile header */}
      <header className={styles.mobileHeader}>
        <button className={styles.hamburger} onClick={() => setOpen(o => !o)}>
          {open ? "✕" : "☰"}
        </button>
        <img src="/logo-fenix.svg" alt="Fénix Grafismo" className={styles.mobileLogo} />
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarTop}>
          <img src="/logo-fenix.svg" alt="Fénix Grafismo" className={styles.logo} />
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.footerName}>Fabricio Fracassa</p>
          <p className={styles.footerSub}>Fénix Grafismo</p>
        </div>
      </aside>

      {/* Overlay móvil */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* Contenido */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
