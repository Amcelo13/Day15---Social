import { Navigate } from "react-router-dom";

const Protected = ({ signed_state, children }) => {
  if (!signed_state) {
    return <Navigate to="/" replace />;
  }
  return children;
};
export default Protected;