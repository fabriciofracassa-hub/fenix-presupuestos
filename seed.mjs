// seed.mjs
// Ejecutar UNA SOLA VEZ: node seed.mjs
// Carga materiales, operarios y máquinas desde los Excel a Firestore

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeoCKcxmVjz_8TTFZXkf0JIgnmttYT7wA",
  authDomain: "fenix-presupuestos.firebaseapp.com",
  projectId: "fenix-presupuestos",
  storageBucket: "fenix-presupuestos.firebasestorage.app",
  messagingSenderId: "1059804034387",
  appId: "1:1059804034387:web:42400bff710ab86cd01da6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── DATOS EXTRAÍDOS DE LOS EXCEL ──────────────────────────────

const materiales = [
  { nombre: "A4", costo: 18, ancho: 21, alto: 29.7, espesor: 0, gramaje: 75, tipo: "unidad" },
  { nombre: "22x17", costo: 10, ancho: 22, alto: 17, espesor: 0, gramaje: 70, tipo: "unidad" },
  { nombre: "Acrílico 3 mm", costo: 35000, ancho: 60, alto: 40, espesor: 3, gramaje: 0, tipo: "area" },
  { nombre: "Acrílico 4 mm", costo: 40000, ancho: 60, alto: 40, espesor: 4, gramaje: 0, tipo: "area" },
  { nombre: "Cadena c/Argolla", costo: 90, ancho: 0, alto: 0, espesor: 0, gramaje: 0, tipo: "unidad" },
  { nombre: "Mármol Carrara", costo: 105000, ancho: 60, alto: 50, espesor: 16, gramaje: 0, tipo: "area" },
  { nombre: "Adhesivo Ilustración", costo: 500, ancho: 31, alto: 457, espesor: 0, gramaje: 160, tipo: "unidad" },
  { nombre: "Mármol Negro Brasil", costo: 50000, ancho: 40, alto: 30, espesor: 16, gramaje: 0, tipo: "area" },
  { nombre: "Bicapa oro/negro", costo: 45000, ancho: 60, alto: 30, espesor: 1.5, gramaje: 0, tipo: "area" },
  { nombre: "Bicapa plata/negro", costo: 45000, ancho: 60, alto: 30, espesor: 1.5, gramaje: 0, tipo: "area" },
  { nombre: "Embellecedor 12mm", costo: 2000, ancho: 12, alto: 12, espesor: 0, gramaje: 0, tipo: "unidad" },
  { nombre: "A4 120g", costo: 93, ancho: 21, alto: 29.7, espesor: 0, gramaje: 120, tipo: "unidad" },
  { nombre: "A3 120g", costo: 120, ancho: 29.7, alto: 42, espesor: 0, gramaje: 120, tipo: "unidad" },
  { nombre: "A3 80g", costo: 50, ancho: 29.7, alto: 42, espesor: 0, gramaje: 80, tipo: "unidad" },
  { nombre: "Cartulina Encapada A3", costo: 700, ancho: 29.7, alto: 42, espesor: 0, gramaje: 300, tipo: "unidad" },
  { nombre: "Varilla Calendario 31", costo: 250, ancho: 31, alto: 1.5, espesor: 0, gramaje: 0, tipo: "unidad" },
  { nombre: "MDF Plus Bco 3 mm", costo: 40000, ancho: 182, alto: 260, espesor: 3, gramaje: 0, tipo: "area" },
  { nombre: "Máscara papel", costo: 45000, ancho: 60, alto: 4000, espesor: 0, gramaje: 0, tipo: "area" },
  { nombre: "Máscara Vinilo", costo: 9000, ancho: 60, alto: 100, espesor: 0, gramaje: 0, tipo: "area" },
  { nombre: "Pintura Hidroesmalte", costo: 50000, ancho: 500, alto: 200, espesor: 0, gramaje: 0, tipo: "area" },
  { nombre: "A4 150g", costo: 100, ancho: 21, alto: 29.7, espesor: 0, gramaje: 150, tipo: "unidad" },
];

const operarios = [
  { nombre: "Fabricio", rol: "Diseñador Gráfico", tarifaHora: 35000 },
  { nombre: "F. Fracassa", rol: "Gráfico", tarifaHora: 30000 },
];

const maquinas = [
  {
    nombre: "Bodor BCL-0605MU", costo: 6250000, calculoPor: "horas",
    vidaUtilHoras: 10400, vidaUtilCopias: 0, copiasPorMinuto: 0,
    consumibles: [
      { nombre: "Fuente", costo: 600000, vidaUtil: 10000, calculoPor: "horas" },
      { nombre: "Tubo laser 80 wats", costo: 1000000, vidaUtil: 6000, calculoPor: "horas" },
    ]
  },
  {
    nombre: "Bizhub C280", costo: 12000000, calculoPor: "copias",
    vidaUtilHoras: 0, vidaUtilCopias: 600000, copiasPorMinuto: 30,
    consumibles: [
      { nombre: "Toner Black",    costo: 150000, vidaUtil: 26000,  calculoPor: "copias" },
      { nombre: "Toner Cyan",     costo: 220000, vidaUtil: 26000,  calculoPor: "copias" },
      { nombre: "Toner Magenta",  costo: 220000, vidaUtil: 26000,  calculoPor: "copias" },
      { nombre: "Toner Yelow",    costo: 220000, vidaUtil: 26000,  calculoPor: "copias" },
      { nombre: "U. Rev. K",      costo: 515000, vidaUtil: 600000, calculoPor: "copias" },
      { nombre: "U. Rev. C",      costo: 655000, vidaUtil: 120000, calculoPor: "copias" },
      { nombre: "U. Rev. M",      costo: 655000, vidaUtil: 120000, calculoPor: "copias" },
      { nombre: "U. Rev. Y",      costo: 655000, vidaUtil: 120000, calculoPor: "copias" },
      { nombre: "U. Img. K",      costo: 440000, vidaUtil: 120000, calculoPor: "copias" },
      { nombre: "U. Img. C",      costo: 700000, vidaUtil: 90000,  calculoPor: "copias" },
      { nombre: "U.Img. M",       costo: 700000, vidaUtil: 90000,  calculoPor: "copias" },
      { nombre: "U. Img. Y",      costo: 700000, vidaUtil: 90000,  calculoPor: "copias" },
    ]
  },
  {
    nombre: "Epson R270", costo: 500000, calculoPor: "copias",
    vidaUtilHoras: 0, vidaUtilCopias: 10000, copiasPorMinuto: 20,
    consumibles: [
      { nombre: "Tinta Black",    costo: 30000, vidaUtil: 470, calculoPor: "copias" },
      { nombre: "Tinta Cyan",     costo: 30000, vidaUtil: 470, calculoPor: "copias" },
      { nombre: "Tinta Cyan L",   costo: 30000, vidaUtil: 470, calculoPor: "copias" },
      { nombre: "Tinta Magenta",  costo: 30000, vidaUtil: 470, calculoPor: "copias" },
      { nombre: "Tinta Magenta L",costo: 30000, vidaUtil: 470, calculoPor: "copias" },
      { nombre: "Tinta Yelow",    costo: 30000, vidaUtil: 470, calculoPor: "copias" },
    ]
  },
  {
    nombre: "Rafer 450Vs", costo: 3500000, calculoPor: "horas",
    vidaUtilHoras: 10400, vidaUtilCopias: 0, copiasPorMinuto: 0,
    consumibles: [
      { nombre: "Liston De Corte", costo: 12000,  vidaUtil: 8000,  calculoPor: "horas" },
      { nombre: "Cuchilla",        costo: 100000, vidaUtil: 10400, calculoPor: "horas" },
    ]
  },
];

// ── CARGA ────────────────────────────────────────────────────

async function cargar() {
  console.log("Cargando materiales...");
  for (const m of materiales) {
    await addDoc(collection(db, "materiales"), { ...m, updatedAt: serverTimestamp() });
    process.stdout.write(`  ✓ ${m.nombre}\n`);
  }

  console.log("\nCargando operarios...");
  for (const o of operarios) {
    await addDoc(collection(db, "operarios"), { ...o, updatedAt: serverTimestamp() });
    process.stdout.write(`  ✓ ${o.nombre}\n`);
  }

  console.log("\nCargando máquinas...");
  for (const maq of maquinas) {
    await addDoc(collection(db, "maquinas"), { ...maq, updatedAt: serverTimestamp() });
    process.stdout.write(`  ✓ ${maq.nombre} (${maq.consumibles.length} consumibles)\n`);
  }

  console.log("\n✅ Todo cargado correctamente.");
  process.exit(0);
}

cargar().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
