import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, serverTimestamp, setDoc
} from "firebase/firestore";
import { db } from "./firebase";

// ── Materiales ──────────────────────────────────────────────
export const getMateriales = async () => {
  const q = query(collection(db, "materiales"), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addMaterial = (data) =>
  addDoc(collection(db, "materiales"), { ...data, updatedAt: serverTimestamp() });
export const updateMaterial = (id, data) =>
  updateDoc(doc(db, "materiales", id), { ...data, updatedAt: serverTimestamp() });
export const deleteMaterial = (id) => deleteDoc(doc(db, "materiales", id));

// ── Operarios ───────────────────────────────────────────────
export const getOperarios = async () => {
  const q = query(collection(db, "operarios"), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addOperario = (data) =>
  addDoc(collection(db, "operarios"), { ...data, updatedAt: serverTimestamp() });
export const updateOperario = (id, data) =>
  updateDoc(doc(db, "operarios", id), { ...data, updatedAt: serverTimestamp() });
export const deleteOperario = (id) => deleteDoc(doc(db, "operarios", id));

// ── Máquinas ────────────────────────────────────────────────
export const getMaquinas = async () => {
  const q = query(collection(db, "maquinas"), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const addMaquina = (data) =>
  addDoc(collection(db, "maquinas"), { ...data, updatedAt: serverTimestamp() });
export const updateMaquina = (id, data) =>
  updateDoc(doc(db, "maquinas", id), { ...data, updatedAt: serverTimestamp() });
export const deleteMaquina = (id) => deleteDoc(doc(db, "maquinas", id));

// ── Costos Fijos ────────────────────────────────────────────
export const getCostosFijos = async () => {
  const ref = doc(db, "config", "costosFijos");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {
    luz: 0, gas: 0, internet: 0, alquiler: 0, afip: 0, otros: 0,
    horasProductivasMes: 120
  };
};
export const saveCostosFijos = (data) =>
  setDoc(doc(db, "config", "costosFijos"), { ...data, updatedAt: serverTimestamp() });

// ── Presupuestos ────────────────────────────────────────────
export const getPresupuestos = async () => {
  const q = query(collection(db, "presupuestos"), orderBy("creadoEn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const getPresupuesto = async (id) => {
  const snap = await getDoc(doc(db, "presupuestos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
export const addPresupuesto = (data) =>
  addDoc(collection(db, "presupuestos"), { ...data, creadoEn: serverTimestamp() });
export const updatePresupuesto = (id, data) =>
  updateDoc(doc(db, "presupuestos", id), { ...data, actualizadoEn: serverTimestamp() });
export const deletePresupuesto = (id) => deleteDoc(doc(db, "presupuestos", id));
