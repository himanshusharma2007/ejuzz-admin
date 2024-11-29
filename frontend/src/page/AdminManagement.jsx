import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    ChevronDown, 
    ChevronUp, 
    Filter, 
    X 
} from 'lucide-react';

// Permissions from the admin model
const ALL_PERMISSIONS = [
    'manage_admins',
    'manage_merchants', 
    'manage_customers', 
    'manage_products', 
    'manage_orders', 
    'manage_transactions', 
    'manage_reports'
];

const AdminManagementPage = () => {
    // State Management
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [selectedPermissionsFilter, setSelectedPermissionsFilter] = useState([]);
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);

    // Error and Notification States
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form State
    const [adminForm, setAdminForm] = useState({
        name: '',
        email: '',
        role: 'Moderator',
        permissions: [],
        isActive: true
    });

    // Fetch Admins with Error Handling
    const fetchAdmins = useCallback(async () => {
        try {
            const response = await adminService.getAllAdmins();
            console.log('response', response)
            setAdmins(response.data);
            setError(null);
        } catch (error) {
            setError('Failed to fetch admin list. Please try again.');
            console.error('Failed to fetch admins', error);
        }
    }, []);
   

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // Advanced Filtering and Sorting
    useEffect(() => {
        let result = [...admins];

        // Search Filter
        if (searchTerm) {
            result = result.filter(admin => 
                admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.loginId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Permissions Filter
        if (selectedPermissionsFilter.length > 0) {
            result = result.filter(admin => 
                selectedPermissionsFilter.every(perm => 
                    admin.permissions.includes(perm)
                )
            );
        }

        // Sorting
        result.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredAdmins(result);
    }, [admins, searchTerm, selectedPermissionsFilter, sortConfig]);

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdminForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePermissionToggle = (permission) => {
        setAdminForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    // Admin Actions
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminService.createAdmin(adminForm);
            await fetchAdmins();
            setIsCreateModalOpen(false);
            setSuccess('Admin created successfully');
            // Reset form
            setAdminForm({
                name: '',
                email: '',
                role: 'Moderator',
                permissions: [],
                isActive: true
            });
        } catch (error) {
            setError('Failed to create admin. Please check your inputs.');
            console.error('Failed to create admin', error);
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateAdmin(currentAdmin._id, adminForm);
            await fetchAdmins();
            setIsEditModalOpen(false);
            setSuccess('Admin updated successfully');
        } catch (error) {
            setError('Failed to update admin. Please check your inputs.');
            console.error('Failed to update admin', error);
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        try {
            await adminService.deleteAdmin(adminId);
            await fetchAdmins();
            setSuccess('Admin deleted successfully');
        } catch (error) {
            setError('Failed to delete admin. Please try again.');
            console.error('Failed to delete admin', error);
        }
    };

    const handleUpdatePermissions = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateAdminPermissions(currentAdmin._id, { 
                permissions: adminForm.permissions 
            });
            await fetchAdmins();
            setIsPermissionModalOpen(false);
            setSuccess('Permissions updated successfully');
        } catch (error) {
            setError('Failed to update permissions. Please try again.');
            console.error('Failed to update admin permissions', error);
        }
    };

    // Render Error/Success Notifications
    const renderNotification = () => {
        if (error) {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <span 
                        className="absolute top-0 bottom-0 right-0 px-4 py-3" 
                        onClick={() => setError(null)}
                    >
                        <X size={20} />
                    </span>
                </div>
            );
        }
        if (success) {
            return (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{success}</span>
                    <span 
                        className="absolute top-0 bottom-0 right-0 px-4 py-3" 
                        onClick={() => setSuccess(null)}
                    >
                        <X size={20} />
                    </span>
                </div>
            );
        }
        return null;
    };

    // Render Modals
    const renderCreateAdminModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
                <form onSubmit={handleCreateAdmin}>
                    <input
                        type="text"
                        name="name"
                        value={adminForm.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={adminForm.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                   
                    <div className="mb-4">
                        <label className="block mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ALL_PERMISSIONS.map(permission => (
                                <label key={permission} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={adminForm.permissions.includes(permission)}
                                        onChange={() => handlePermissionToggle(permission)}
                                        className="mr-2"
                                    />
                                    {permission.replace('_', ' ').replace('manage', 'Manage')}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Create Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderEditAdminModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Admin</h2>
                <form onSubmit={handleUpdateAdmin}>
                    <input
                        type="text"
                        name="name"
                        value={adminForm.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={adminForm.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                  
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Update Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderPermissionModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Update Permissions for {currentAdmin?.name}</h2>
                <form onSubmit={handleUpdatePermissions}>
                    <div className="mb-4">
                        <label className="block mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ALL_PERMISSIONS.map(permission => (
                                <label key={permission} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={adminForm.permissions.includes(permission)}
                                        onChange={() => handlePermissionToggle(permission)}
                                        className="mr-2"
                                    />
                                    {permission.replace('_', ' ').replace('manage', 'Manage')}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button"
                            onClick={() => setIsPermissionModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Update Permissions
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderAdminList = () => (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="ml-4 text-nowrap bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                >
                    <Plus className="mr-2" size={20} /> Add Admin
                </button>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-200">
                        <th 
                            className="p-3 text-left cursor-pointer"
                            onClick={() => setSortConfig({
                                key: 'name', 
                                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            })}
                        >
                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Permissions</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAdmins.map(admin => (
                      <tr key={admin._id} className="border-b">
                      <td className="p-3">{admin.name}</td>
                      <td className="p-3">{admin.email}</td>
                      <td className="p-3">{admin.role}</td>
                      <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                              {admin.permissions.map(perm => (
                                  <span 
                                      key={perm} 
                                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                  >
                                      {perm.replace('_', ' ').replace('manage', 'Manage')}
                                  </span>
                              ))}
                          </div>
                      </td>
                      <td className="p-3 flex space-x-2">
                          <button 
                              onClick={() => {
                                  setCurrentAdmin(admin);
                                  setAdminForm({
                                      name: admin.name,
                                      email: admin.email,
                                      role: admin.role || 'Moderator',
                                      permissions: admin.permissions || []
                                  });
                                  setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                          >
                              <Edit size={20} />
                          </button>
                          <button 
                              onClick={() => {
                                  setCurrentAdmin(admin);
                                  setAdminForm({
                                      ...admin,
                                      permissions: admin.permissions || []
                                  });
                                  setIsPermissionModalOpen(true);
                              }}
                              className="text-green-600 hover:bg-green-100 p-1 rounded"
                          >
                              <Filter size={20} />
                          </button>
                          <button 
                              onClick={() => {
                                  if(window.confirm(`Are you sure you want to delete admin ${admin.name}?`)) {
                                      handleDeleteAdmin(admin._id);
                                  }
                              }}
                              className="text-red-600 hover:bg-red-100 p-1 rounded"
                          >
                              <Trash2 size={20} />
                          </button>
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>
  </div>
);

return (
  <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Management</h1>
      
      {renderNotification()}
      
      {renderAdminList()}
      
      {isCreateModalOpen && renderCreateAdminModal()}
      {isEditModalOpen && renderEditAdminModal()}
      {isPermissionModalOpen && renderPermissionModal()}
  </div>
);
};

export default AdminManagementPage;