import React from "react";
import { useSelector } from "react-redux";
import { User, Settings, Shield, Clock, Mail, Check, X } from "lucide-react";
import { selectUserData } from '../redux/slices/userSlice';
const Profile = () => {
  // Extract admin data from Redux store
  const admin = useSelector(selectUserData); 
 console.log('admin', admin)
  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center space-x-6">
            <div className="bg-white p-1 rounded-full">
              <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{admin.name}</h1>
              <p className="text-white text-opacity-80">{admin.role}</p>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-3 text-blue-600" /> Personal Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="mr-3 text-gray-500" />
                <span>{admin.email}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-3 text-gray-500" />
                <span>Created: {formatDate(admin.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-3 text-gray-500" />
                <span>Last Login: {formatDate(admin.lastLogin)}</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-3 text-blue-600" /> Account Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                {admin.isActive ? (
                  <Check className="mr-3 text-green-500" />
                ) : (
                  <X className="mr-3 text-red-500" />
                )}
                <span>Status: {admin.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center">
                <Settings className="mr-3 text-gray-500" />
                <span>Login ID: {admin.loginId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="p-6 bg-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="mr-3 text-blue-600" /> Permissions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {admin.permissions.map((permission, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-lg shadow-sm text-center"
              >
                {permission.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        </div>

        {/* Platform Settings */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="mr-3 text-blue-600" /> Platform Settings
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Commission Rate</p>
              <p className="font-bold">
                {admin.platformSettings.commissionRate * 100}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Currency</p>
              <p className="font-bold">{admin.platformSettings.currency}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Max Wallet Limit</p>
              <p className="font-bold">
                {admin.platformSettings.maxWalletLimit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
