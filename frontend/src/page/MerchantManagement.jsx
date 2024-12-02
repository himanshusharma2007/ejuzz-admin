import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Tabs, Tab, Box } from "@mui/material";
import merchantService from "../services/merchantService"; // Import the merchant service
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../component/UI/LoadingSpinner";

const MerchantManagement = () => {
  // State Management
  const [merchants, setMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const showToast = useToast();

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

  // Add tab state
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      fetchMerchants();
    } else {
      fetchPendingMerchants();
    }
  };

  // Fetch Merchants
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getAllMerchants();
      setMerchants(response.data);
      setFilteredMerchants(response.data);
    } catch (err) {
      setError("Failed to fetch merchants");
      showToast(`Failed to fetch merchants: ${err.message}`, "error");
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
      showToast(`Failed to fetch pending merchants: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
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
        filterStatus === "active"
          ? merchant.isActive
          : filterStatus === "blocked"
          ? !merchant.isActive
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

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Render Methods
  const renderMerchantTable = () => {
    if (filteredMerchants.length === 0) {
      return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="flex justify-center items-center p-12">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tabValue === 1
                  ? "No Pending Verifications"
                  : "No Merchants Found"}
              </h3>
              <p className="text-gray-500">
                {tabValue === 1
                  ? "There are currently no merchants waiting for verification."
                  : "No merchants match your search criteria."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        {/* Search and Filter Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search merchants..."
                className="pl-10 pr-4 py-2.5 w-72 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
            </div>
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Merchants</option>
              <option value="active">Active Merchants</option>
              <option value="blocked">Blocked Merchants</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <Users size={18} />
            <span className="font-medium">
              {filteredMerchants.length} Merchants
            </span>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "name", label: "Merchant Name" },
                { key: "email", label: "Email" },
                { key: "createdAt", label: "Joined Date" },
                { key: "isVerify", label: "Verification" },
                { key: "isActive", label: "Status" },
                { label: "Actions" },
              ].map((column) => (
                <th
                  key={column.key || "actions"}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                  onClick={() => column.key && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.key && (
                      <div className="flex flex-col">
                        <ChevronUp
                          size={14}
                          className={`${
                            sortConfig.key === column.key &&
                            sortConfig.direction === "asc"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <ChevronDown
                          size={14}
                          className={`-mt-1 ${
                            sortConfig.key === column.key &&
                            sortConfig.direction === "desc"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentMerchants.map((merchant) => (
              <tr
                key={merchant._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {merchant.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{merchant.email}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(merchant.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      merchant.isVerify
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {merchant.isVerify ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {merchant.isVerify ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      merchant.isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {merchant.isActive ? (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    )}
                    {merchant.isActive ? "Active" : "Blocked"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/merchants/${merchant._id}`)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                   
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstMerchant + 1} to{" "}
            {Math.min(indexOfLastMerchant, filteredMerchants.length)} of{" "}
            {filteredMerchants.length} merchants
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={
                currentPage ===
                Math.ceil(filteredMerchants.length / merchantsPerPage)
              }
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };


  // Replace the header buttons with Material UI Tabs
  const renderTabs = () => (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="merchant management tabs"
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
          },
          "& .Mui-selected": {
            color: "rgb(37, 99, 235) !important",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "rgb(37, 99, 235)",
          },
        }}
      >
        <Tab
          label="All Merchants"
          icon={<Users size={18} />}
          iconPosition="start"
        />
        <Tab
          label="Pending Verifications"
          icon={<AlertCircle size={18} />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );

  if (error)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-red-500 bg-red-50 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Merchant Management
        </h1>
      </div>

      {renderTabs()}
      {loading ? <LoadingSpinner /> : renderMerchantTable()}
    
    </div>
  );
};

export default MerchantManagement;
