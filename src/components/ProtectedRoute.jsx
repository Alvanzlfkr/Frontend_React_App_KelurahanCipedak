import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../utils/token/token.jsx";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
