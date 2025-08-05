import { ReactNode } from 'react';
import { useRoleAccess, UserRole } from '@/hooks/useRoleAccess';
import Icon from '@/components/Icon';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermission?: keyof import('@/hooks/useRoleAccess').RolePermissions;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

const RoleProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles,
  requiredPermission,
  fallback,
  showAccessDenied = true,
}: RoleProtectedRouteProps) => {
  const { hasRole, hasAnyRole, hasPermission } = useRoleAccess();

  // Check if user has required access
  let hasAccess = true;

  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  } else if (requiredRoles) {
    hasAccess = hasAnyRole(requiredRoles);
  } else if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAccessDenied) {
      return (
        <div className="text-center py-8">
          <Icon name="lock" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            You don't have permission to access this feature.
          </p>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;