import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import merchantService from "../services/merchantService"; // Import the merchant service
import { toast } from "sonner"; // Assuming you're using sonner for notifications
import { useNavigate } from "react-router-dom";

const MerchantManagement = () => {
  // State Management
  const [merchants, setMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [merchantsPerPage] = useState(10);
  const navigate = useNavigate();
  // Modal States
  const [selectedMerchant, setSelectedMerchant] = useState(null);
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Fetch Merchants
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getAllMerchants();
      setMerchants(response.data);
      setFilteredMerchants(response.data);
    } catch (err) {
      setError("Failed to fetch merchants");
      toast.error("Failed to fetch merchants", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Pending Merchants
  const fetchPendingMerchants = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getPendingVerifications();
      setMerchants(response.data);
      setFilteredMerchants(response.data);
    } catch (err) {
      setError("Failed to fetch pending merchants");
      toast.error("Failed to fetch pending merchants", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

//   // Fetch Merchant Details
//   const fetchMerchantDetails = async (merchantId) => {
//     try {
//       const response = await merchantService.getMerchantDetails(merchantId);
//       setSelectedMerchant(response.data);
//       setIsDetailsModalOpen(true);
//     } catch (err) {
//       toast.error("Failed to fetch merchant details", {
//         description: err.message,
//       });
//     }
//   };

  // Verification Handler
  const handleVerification = async (merchantId, status) => {
    try {
      await merchantService.verifyMerchant(merchantId, { status });
      toast.success(`Merchant ${status} successfully`);
      fetchMerchants();
      setIsVerificationModalOpen(false);
    } catch (err) {
      toast.error("Verification failed", {
        description: err.message,
      });
    }
  };

//   // Status Change Handler
//   const handleStatusChange = async (merchantId, active) => {
//     try {
//       await merchantService.updateMerchantStatus(merchantId, { active });
//       toast.success(
//         `Merchant ${active ? "activated" : "suspended"} successfully`
//       );
//       fetchMerchants();
//     } catch (err) {
//       toast.error("Failed to update merchant status", {
//         description: err.message,
//       });
//     }
//   };

  // Advanced Filtering Effect
  useEffect(() => {
    let result = merchants;

    // Search Filter
    if (searchTerm) {
      result = result.filter(
        (merchant) =>
          merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status Filter
    if (filterStatus !== "all") {
      result = result.filter((merchant) =>
        filterStatus === "verified"
          ? merchant.isVerify
          : filterStatus === "pending"
          ? !merchant.isVerify
          : true
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredMerchants(result);
  }, [searchTerm, filterStatus, sortConfig, merchants]);

  // Pagination Logic
  const indexOfLastMerchant = currentPage * merchantsPerPage;
  const indexOfFirstMerchant = indexOfLastMerchant - merchantsPerPage;
  const currentMerchants = filteredMerchants.slice(
    indexOfFirstMerchant,
    indexOfLastMerchant
  );

  // Initial Data Fetch
  useEffect(() => {
    fetchMerchants();
  }, []);
  // Render Methods
  const renderMerchantTable = () => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search merchants..."
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          <select
            className="px-4 py-2 border rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Merchants</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users size={20} />
          <span>{filteredMerchants.length} Total Merchants</span>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            {[
              { key: "name", label: "Merchant Name" },
              { key: "email", label: "Email" },
              { key: "createdAt", label: "Joined Date" },
              { key: "isVerify", label: "Status" },
              { label: "Actions" },
            ].map((column) => (
              <th
                key={column.key || "actions"}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => column.key && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.key && (
                    <div className="ml-2">
                      <ChevronUp
                        size={16}
                        className={`text-gray-400 ${
                          sortConfig.key === column.key &&
                          sortConfig.direction === "asc"
                            ? "text-blue-600"
                            : ""
                        }`}
                      />
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 ${
                          sortConfig.key === column.key &&
                          sortConfig.direction === "desc"
                            ? "text-blue-600"
                            : ""
                        }`}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentMerchants.map((merchant) => (
            <tr
              key={merchant._id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">{merchant.name}</td>
              <td className="px-4 py-3">{merchant.email}</td>
              <td className="px-4 py-3">
                {new Date(merchant.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    merchant.isVerify
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {merchant.isVerify ? "Verified" : "Pending"}
                </span>
              </td>
              <td className="px-4 py-3 flex space-x-2">
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => navigate(`/merchants/${merchant._id}`)}
                >
                  View Details
                </button>
                {/* {!merchant.isVerify && (
                  <button
                    className="text-green-500 hover:text-green-700"
                    onClick={() => {
                      setSelectedMerchant(merchant);
                      setIsVerificationModalOpen(true);
                    }}
                  >
                    Verify
                  </button>
                )} */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <div>
          Showing {indexOfFirstMerchant + 1} to{" "}
          {Math.min(indexOfLastMerchant, filteredMerchants.length)}
          of {filteredMerchants.length} merchants
        </div>
        <div className="flex space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={
              currentPage ===
              Math.ceil(filteredMerchants.length / merchantsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

//   // Merchant Details Modal
//   const renderDetailsModal = () =>
//     selectedMerchant && (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//         <div className="bg-white rounded-lg shadow-xl p-6 w-96">
//           <h2 className="text-xl font-bold mb-4">Merchant Details</h2>
//           <div className="space-y-2">
//             <p>
//               <strong>Name:</strong> {selectedMerchant.name}
//             </p>
//             <p>
//               <strong>Email:</strong> {selectedMerchant.email}
//             </p>
//             <p>
//               <strong>Phone:</strong> {selectedMerchant.phoneNo}
//             </p>
//             <p>
//               <strong>Address:</strong> {selectedMerchant.address}
//             </p>
//             <p>
//               <strong>Status:</strong>{" "}
//               {selectedMerchant.isVerify ? "Verified" : "Pending"}
//             </p>
//             <div className="flex justify-end space-x-2 mt-4">
//               <button
//                 onClick={() => setIsDetailsModalOpen(false)}
//                 className="px-4 py-2 bg-gray-200 rounded"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );

  const renderVerificationModal = () =>
    selectedMerchant && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-96">
          <h2 className="text-xl font-bold mb-4">Verify Merchant</h2>
          <p>Are you sure you want to verify {selectedMerchant.name}?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setIsVerificationModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleVerification(selectedMerchant._id, "approved")
              }
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Confirm Verification
            </button>
          </div>
        </div>
      </div>
    );

  // Loading and Error States
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );

  // Loading and Error States
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          Merchant Management
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchMerchants}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            All Merchants
          </button>
          <button
            onClick={fetchPendingMerchants}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Pending Verifications
          </button>
        </div>
      </div>

      {renderMerchantTable()}

      {/* {isDetailsModalOpen && renderDetailsModal()} */}
      {isVerificationModalOpen && renderVerificationModal()}
    </div>
  );
};

export default MerchantManagement;
