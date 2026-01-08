import { Navigate, useLocation } from "react-router-dom";

const ProtectedFlowRoute = ({ children }) => {
  const location = useLocation();
  const resetEmail =
    sessionStorage.getItem("resetEmail") || location.state?.email;
  return resetEmail ? children : <Navigate to="/forgot-password" replace />;
};

export default ProtectedFlowRoute;
