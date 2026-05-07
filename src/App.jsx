import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Presupuestos from "./pages/Presupuestos";
import NuevoPresupuesto from "./pages/NuevoPresupuesto";
import VistaPresupuesto from "./pages/VistaPresupuesto";
import Materiales from "./pages/Materiales";
import Maquinas from "./pages/Maquinas";
import Operarios from "./pages/Operarios";
import CostosFijos from "./pages/CostosFijos";

function EditarWrapper() {
  const { id } = useParams();
  return <NuevoPresupuesto editId={id} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Presupuestos />} />
          <Route path="nuevo" element={<NuevoPresupuesto />} />
          <Route path="editar/:id" element={<EditarWrapper />} />
          <Route path="presupuesto/:id" element={<VistaPresupuesto />} />
          <Route path="materiales" element={<Materiales />} />
          <Route path="maquinas" element={<Maquinas />} />
          <Route path="operarios" element={<Operarios />} />
          <Route path="costos" element={<CostosFijos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
