import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootStateType } from "../redux/store";


const PrivateRoute = () => {
  const accessToken = useSelector((state: RootStateType) => state.auth.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;