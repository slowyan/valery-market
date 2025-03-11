import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminRequired = false }) => {
    const token = adminRequired 
        ? localStorage.getItem('adminToken')
        : localStorage.getItem('token');
    
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
        return <Navigate to={adminRequired ? "/admin/login" : "/login"} />;
    }

    if (adminRequired && !user?.isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute; 