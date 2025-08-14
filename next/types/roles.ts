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


