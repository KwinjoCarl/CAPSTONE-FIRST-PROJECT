import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { appRoutes, authRoutes } from '@/routes/index';
import { useAuthContext } from '@/context/useAuthContext';
import { getRoutePermission } from '@/helpers/permissions';
import AccessDenied from '@/components/common/AccessDenied';
const AppRouter = props => {
  const {
    isAuthenticated,
    hasPermission
  } = useAuthContext();
  return <Routes>
      {(authRoutes || []).map((route, idx) => <Route key={idx + route.name} path={route.path} element={<AuthLayout {...props}>{route.element}</AuthLayout>} />)}

      {(appRoutes || []).map((route, idx) => {
      if (!isAuthenticated) {
        return <Route key={idx + route.name} path={route.path} element={<Navigate to={{
          pathname: '/auth/sign-in',
          search: 'redirectTo=' + route.path
        }} />} />;
      }
      const requiredPermission = getRoutePermission(route.path.replace(/:\w+/g, 'x'));
      if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Route key={idx + route.name} path={route.path} element={<AdminLayout {...props}><AccessDenied permission={requiredPermission} /></AdminLayout>} />;
      }
      return <Route key={idx + route.name} path={route.path} element={<AdminLayout {...props}>{route.element}</AdminLayout>} />;
    })}
    </Routes>;
};
export default AppRouter;