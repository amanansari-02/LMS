import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Admin/Dashboard";
import Skill from "./pages/Admin/Skill";
import AdminLayout from "./Layout/AdminLayout";
import Module from "./pages/Admin/Module";
import ProtectedRoute from "./Layout/protectedLayout";
import LearnerDashboard from "./pages/Dashboard";
import ModuleDetails from "./components/ModuleDeatils";
import LearnerLayout from "./Layout/LearnerLayout";
import Modules from "./pages/Modules";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<Login />} />
        <Route path="/reset-password" element={<Login />} />

        {/* Learner */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LearnerLayout />}>
            <Route path="/dashboard" element={<LearnerDashboard />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/modules/:id" element={<ModuleDetails />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="skills" element={<Skill />} />
            <Route path="modules" element={<Module />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
