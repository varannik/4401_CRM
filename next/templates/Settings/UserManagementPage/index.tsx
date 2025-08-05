"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import { useAuthStore } from "@/stores/auth-store";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  departmentId: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
  companyCount: number;
}

const roleOptions = [
  { id: 1, name: "consultant" },
  { id: 2, name: "dept_admin" },
  { id: 3, name: "sys_admin" }
];

const UserManagementPage = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ id: number; name: string } | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<{ id: number; name: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if current user has permission to manage users
  const canManageUsers = currentUser?.role === 'sys_admin' || currentUser?.role === 'dept_admin';

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
      fetchDepartments();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments);
      } else {
        console.error('Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(roleOptions.find(role => role.name === user.role) || null);
    setSelectedDepartment(
      user.department 
        ? { id: parseInt(user.department.id), name: user.department.name }
        : null
    );
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setSelectedRole(null);
    setSelectedDepartment(null);
    setIsEditModalOpen(false);
    setIsUpdating(false);
  };

  const updateUser = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole.name,
          departmentId: selectedDepartment?.id.toString() || null,
        }),
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the user list
        closeEditModal();
      } else {
        const error = await response.json();
        console.error('Failed to update user:', error);
        alert('Failed to update user: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'sys_admin':
        return 'label label-red';
      case 'dept_admin':
        return 'label label-purple';
      case 'consultant':
        return 'label label-green';
      default:
        return 'label label-gray';
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'sys_admin':
        return 'System Admin';
      case 'dept_admin':
        return 'Department Admin';
      case 'consultant':
        return 'Consultant';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!canManageUsers) {
    return (
      <Layout title="User Management">
        <div className="max-w-6xl">
          <Card className="card" title="Access Denied">
            <div className="p-6 text-center">
              <Icon name="lock" className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">
                You don't have permission to access user management. Only system administrators and department administrators can manage users.
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Department options for select dropdown
  const departmentOptions = [
    { id: 0, name: "No Department" },
    ...departments.map(dept => ({ id: parseInt(dept.id), name: dept.name }))
  ];

  const tableHeaders = ["User", "Role", "Department", "Joined", "Actions"];

  return (
    <Layout title="User Management">
      <div className="max-w-6xl space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card" title="Total Users">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Active users in system</div>
            </div>
          </Card>
          
          <Card className="card" title="Departments">
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Organizational departments</div>
            </div>
          </Card>
          
          <Card className="card" title="Your Role">
            <div className="p-6">
              <div className={`inline-block ${getRoleBadgeClass(currentUser?.role || '')}`}>
                {formatRole(currentUser?.role || '')}
              </div>
              <div className="text-sm text-gray-600 mt-2">Current permissions level</div>
            </div>
          </Card>
        </div>

        {/* Role System Information */}
        <Card className="card" title="Role System Overview">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="profile" className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Consultant</h3>
                <p className="text-sm text-gray-600">
                  View dashboard, add comments, view assigned companies
                </p>
                <div className="mt-2 text-sm font-medium text-green-600">
                  {users.filter(u => u.role === 'consultant').length} users
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="edit" className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Department Admin</h3>
                <p className="text-sm text-gray-600">
                  Above + edit department companies, assign companies, manage department users
                </p>
                <div className="mt-2 text-sm font-medium text-purple-600">
                  {users.filter(u => u.role === 'dept_admin').length} users
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="shield" className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">System Admin</h3>
                <p className="text-sm text-gray-600">
                  Full system access, user management, system configuration
                </p>
                <div className="mt-2 text-sm font-medium text-red-600">
                  {users.filter(u => u.role === 'sys_admin').length} users
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card 
          className="card" 
          title={`System Users (${users.length})`}
          headContent={
            currentUser?.role === 'sys_admin' && (
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )
          }
        >
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-gray-600">Loading users...</div>
            </div>
          ) : users.length > 0 ? (
            <Table
              cellsThead={
                <>
                  {tableHeaders.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </>
              }
            >
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={getRoleBadgeClass(user.role)}>
                      {formatRole(user.role)}
                    </div>
                  </td>
                  <td>
                    <div className="text-gray-900">
                      {user.department?.name || 'No Department'}
                    </div>
                  </td>
                  <td>
                    <div className="text-gray-600">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td>
                    <Button
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                      onClick={() => openEditModal(user)}
                    >
                      <Icon name="edit" className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="text-center py-8">
              <Icon name="profile" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </Card>

        {/* Edit User Modal */}
        <Modal
          classWrapper="max-w-2xl !p-8"
          open={isEditModalOpen}
          onClose={closeEditModal}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit User Permissions</h2>
              <Button
                className="text-gray-400 hover:text-gray-600"
                onClick={closeEditModal}
                isCircle
              >
                <Icon name="close" className="w-5 h-5" />
              </Button>
            </div>

            {selectedUser && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedUser.name || 'No Name'}</div>
                      <div className="text-sm text-gray-600">{selectedUser.email}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Role"
                    value={selectedRole}
                    onChange={setSelectedRole}
                    options={roleOptions}
                    placeholder="Select a role"
                  />

                  <Select
                    label="Department"
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    options={departmentOptions}
                    placeholder="Select a department"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <Icon name="alert" className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Permission Changes</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Changing user roles will immediately affect their access permissions. Make sure you understand the implications before saving.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={updateUser}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </Button>
                  <Button
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserManagementPage;