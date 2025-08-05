import { useAuthStore } from '@/stores/auth-store';

export type UserRole = 'consultant' | 'dept_admin' | 'sys_admin';

export interface RolePermissions {
  // Dashboard permissions
  canViewDashboard: boolean;
  canAddComments: boolean;
  
  // Company permissions
  canViewAssignedCompanies: boolean;
  canViewAllCompanies: boolean;
  canEditCompanies: boolean;
  canAssignCompanies: boolean;
  
  // User management permissions
  canViewUsers: boolean;
  canManageUsers: boolean;
  canManageDepartmentUsers: boolean;
  
  // System permissions
  canAccessSystemSettings: boolean;
  canManageDepartments: boolean;
  canViewReports: boolean;
  
  // Department permissions
  canManageDepartment: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  consultant: {
    // Dashboard permissions
    canViewDashboard: true,
    canAddComments: true,
    
    // Company permissions
    canViewAssignedCompanies: true,
    canViewAllCompanies: false,
    canEditCompanies: false,
    canAssignCompanies: false,
    
    // User management permissions
    canViewUsers: false,
    canManageUsers: false,
    canManageDepartmentUsers: false,
    
    // System permissions
    canAccessSystemSettings: false,
    canManageDepartments: false,
    canViewReports: true, // Basic reports only
    
    // Department permissions
    canManageDepartment: false,
  },
  
  dept_admin: {
    // Dashboard permissions
    canViewDashboard: true,
    canAddComments: true,
    
    // Company permissions
    canViewAssignedCompanies: true,
    canViewAllCompanies: true, // Department companies
    canEditCompanies: true,
    canAssignCompanies: true,
    
    // User management permissions
    canViewUsers: true,
    canManageUsers: false,
    canManageDepartmentUsers: true,
    
    // System permissions
    canAccessSystemSettings: false,
    canManageDepartments: false,
    canViewReports: true,
    
    // Department permissions
    canManageDepartment: true,
  },
  
  sys_admin: {
    // Dashboard permissions
    canViewDashboard: true,
    canAddComments: true,
    
    // Company permissions
    canViewAssignedCompanies: true,
    canViewAllCompanies: true,
    canEditCompanies: true,
    canAssignCompanies: true,
    
    // User management permissions
    canViewUsers: true,
    canManageUsers: true,
    canManageDepartmentUsers: true,
    
    // System permissions
    canAccessSystemSettings: true,
    canManageDepartments: true,
    canViewReports: true,
    
    // Department permissions
    canManageDepartment: true,
  },
};

export const useRoleAccess = () => {
  const { user } = useAuthStore();
  
  const currentRole = (user?.role as UserRole) || 'consultant';
  const permissions = rolePermissions[currentRole];
  
  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };
  
  const hasRole = (role: UserRole): boolean => {
    return currentRole === role;
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(currentRole);
  };
  
  const isAtLeastRole = (minRole: UserRole): boolean => {
    const roleHierarchy: UserRole[] = ['consultant', 'dept_admin', 'sys_admin'];
    const currentRoleIndex = roleHierarchy.indexOf(currentRole);
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    
    return currentRoleIndex >= minRoleIndex;
  };
  
  const canAccessRoute = (route: string): boolean => {
    // Define route-specific access rules
    const routeAccess: Record<string, keyof RolePermissions> = {
      '/settings/users': 'canViewUsers',
      '/settings/departments': 'canManageDepartments',
      '/companies/new': 'canEditCompanies',
      '/companies/edit': 'canEditCompanies',
      '/reports': 'canViewReports',
    };
    
    const requiredPermission = routeAccess[route];
    return requiredPermission ? hasPermission(requiredPermission) : true;
  };
  
  return {
    currentRole,
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAtLeastRole,
    canAccessRoute,
    
    // Convenience methods for common checks
    isConsultant: hasRole('consultant'),
    isDeptAdmin: hasRole('dept_admin'),
    isSysAdmin: hasRole('sys_admin'),
    canManageAnyUsers: hasPermission('canManageUsers') || hasPermission('canManageDepartmentUsers'),
    canEditAnyCompanies: hasPermission('canEditCompanies'),
  };
};

// Utility function for server-side role checking
export const hasServerPermission = (userRole: string, permission: keyof RolePermissions): boolean => {
  const role = (userRole as UserRole) || 'consultant';
  return rolePermissions[role]?.[permission] || false;
};

// HOC for protecting components based on roles
export const withRoleProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: keyof RolePermissions,
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { hasPermission } = useRoleAccess();
    
    if (!hasPermission(requiredPermission)) {
      return fallback || <div>Access denied</div>;
    }
    
    return <Component {...props} />;
  };
};