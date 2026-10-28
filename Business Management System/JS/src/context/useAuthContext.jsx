import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext(undefined);
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
const authSessionKey = '_BMS_AUTH_KEY_';
export function AuthProvider({
  children
}) {
  const navigate = useNavigate();
  const getSession = () => {
    const fetchedCookie = getCookie(authSessionKey)?.toString();
    if (!fetchedCookie) return;else return JSON.parse(fetchedCookie);
  };
  const [user, setUser] = useState(getSession());
  const saveSession = user => {
    setCookie(authSessionKey, JSON.stringify(user));
    setUser(user);
  };
  const removeSession = () => {
    deleteCookie(authSessionKey);
    setUser(undefined);
    navigate('/auth/sign-in');
  };

  const hasPermission = permission => {
    if (!permission) return true;
    if (!user) return false;
    // Admin role always has full access
    if (user.role === 'Admin') return true;
    const perms = user.permissions || [];
    return perms.includes(permission);
  };

  const hasAnyPermission = permissions => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(p => hasPermission(p));
  };

  return <AuthContext.Provider value={{
    user,
    isAuthenticated: hasCookie(authSessionKey),
    saveSession,
    removeSession,
    hasPermission,
    hasAnyPermission
  }}>
      {children}
    </AuthContext.Provider>;
}