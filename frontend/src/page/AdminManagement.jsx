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
    const [createForm, setCreateForm] = useState({
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
        setCreateForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePermissionToggle = (permission) => {
        setCreateForm(prev => ({
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
            await adminService.createAdmin(createForm);
            await fetchAdmins();
            resetCreateForm();
            setIsCreateModalOpen(false);
            setSuccess('Admin created successfully');
        } catch (error) {
            setError('Failed to create admin. Please check your inputs.');
            console.error('Failed to create admin', error);
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateAdmin(currentAdmin._id, createForm);
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
                permissions: createForm.permissions 
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

    // Add this helper function near the top of the component
    const resetCreateForm = () => {
        setCreateForm({
            name: '',
            email: '',
            role: 'Moderator',
            permissions: [],
            isActive: true
        });
    };

    // Render Modals with improved UI
    const renderCreateAdminModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl w-[500px] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Create New Admin</h2>
                    <button 
                        onClick={() => {
                            resetCreateForm();
                            setIsCreateModalOpen(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            placeholder="Enter full name"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            placeholder="Enter email address"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                            {ALL_PERMISSIONS.map(permission => (
                                <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.permissions.includes(permission)}
                                        onChange={() => {
                                            setCreateForm(prev => ({
                                                ...prev,
                                                permissions: prev.permissions.includes(permission)
                                                    ? prev.permissions.filter(p => p !== permission)
                                                    : [...prev.permissions, permission]
                                            }));
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {permission.split('_').map(word => 
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => {
                                resetCreateForm();
                                setIsCreateModalOpen(false);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                        >
                            <Plus size={20} className="mr-2" />
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
                        value={createForm.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={createForm.email}
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
                                        checked={createForm.permissions.includes(permission)}
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

    // Improved Admin List UI
    const renderAdminList = () => (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <button 
                        onClick={() => {
                            resetCreateForm();
                            setIsCreateModalOpen(true);
                        }}
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center transition-colors"
                    >
                        <Plus className="mr-2" size={20} /> Add Admin
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                <button 
                                    className="flex items-center space-x-1 hover:text-gray-900"
                                    onClick={() => setSortConfig({
                                        key: 'name',
                                        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                                    })}
                                >
                                    <span>Name</span>
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ? 
                                        <ChevronUp size={16} /> : 
                                        <ChevronDown size={16} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Permissions</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredAdmins.map(admin => (
                            <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{admin.name}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className="text-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {admin.permissions.map(perm => (
                                            <span 
                                                key={perm}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                            >
                                                {perm.split('_').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => {
                                                setCurrentAdmin(admin);
                                                setCreateForm({
                                                    name: admin.name,
                                                    email: admin.email,
                                                    role: admin.role || 'Moderator',
                                                    permissions: admin.permissions || []
                                                });
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                            title="Edit Admin"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setCurrentAdmin(admin);
                                                setCreateForm({
                                                    ...admin,
                                                    permissions: admin.permissions || []
                                                });
                                                setIsPermissionModalOpen(true);
                                            }}
                                            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                            title="Manage Permissions"
                                        >
                                            <Filter size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`Are you sure you want to delete admin ${admin.name}?`)) {
                                                    handleDeleteAdmin(admin._id);
                                                }
                                            }}
                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            title="Delete Admin"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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