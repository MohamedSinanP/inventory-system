import { Routes, Route } from "react-router-dom";
import SignupPage from '../pages/user/SignupPage';
import InventoryPage from "../pages/user/InventoryPage";
import ReportsPage from "../pages/user/ReportPage";
import PrivateRoute from "../components/PrivateRoute";
import LoginPage from "../pages/user/LoginPage";
import SalesPage from "../pages/user/SalesPage";
import CustomersPage from "../pages/user/CustomerPage";
const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/customer" element={<CustomersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/sales" element={<SalesPage />} />
        </Route >
      </Routes >
    </>
  )
}

export default AppRoutes
