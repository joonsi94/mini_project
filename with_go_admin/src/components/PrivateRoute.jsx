import { Navigate } from 'react-router-dom';
import {message} from "antd";

function PrivateRoute({ children, role: requiredRole }) {
    const userRole = sessionStorage.getItem("role");

    if (userRole !== requiredRole) {
        message.error('권한이없습니다!')
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;
