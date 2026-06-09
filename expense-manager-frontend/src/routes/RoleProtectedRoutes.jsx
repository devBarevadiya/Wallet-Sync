import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CLIENT } from "../constants/routes";
import { authRoleEnum } from "../helpers/enum";

const RoleProtectedRoutes = ({ children }) => {
  const { user, dataLoading } = useSelector((store) => store.Auth);

  if (!dataLoading && user?.role !== authRoleEnum.ADMIN) {
    return <Navigate to={CLIENT.HOME} />;
  } else {
    return <>{children}</>;
  }

  // return <>{children}</>;
};

RoleProtectedRoutes.propTypes = {
  children: PropTypes.any,
};

export default RoleProtectedRoutes;
