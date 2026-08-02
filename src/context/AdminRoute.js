import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Wrap any admin page with this. If the logged-in user isn't an admin,
// they get redirected to the homepage instead of seeing the admin page.
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait until we know for sure who the user is (e.g. on page refresh)
  // before deciding to redirect. Otherwise a real admin gets bounced
  // out during the brief moment /api/auth/me is still loading.
  if (loading) {
    return <div className="loading">⏳ LOADING ...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;