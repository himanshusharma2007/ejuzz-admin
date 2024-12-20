import React, { useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronUp,
    Search,
    Users,
    Eye,
    AlertCircle,
    CheckCircle2,
    Wallet,
} from "lucide-react";
import { Tabs, Tab, Box } from "@mui/material";
import customerService from "../services/customerService";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../component/UI/LoadingSpinner";

const CustomerManagement = () => {
    // State Management
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
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
    const [customersPerPage] = useState(10);

    // Add tab state
    const [tabValue, setTabValue] = useState(0);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 0) {
            fetchCustomers();
        } else {
            fetchUnverifiedCustomers();
        }
    };

    // Fetch Customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getAllCustomers();
            setCustomers(response.data);
            setFilteredCustomers(response.data);
        } catch (err) {
            setError("Failed to fetch customers");
            showToast(`Failed to fetch customers: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Unverified Customers
    const fetchUnverifiedCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getAllCustomers({ isVerified: false });
            setCustomers(response.data);
            setFilteredCustomers(response.data);
        } catch (err) {
            setError("Failed to fetch unverified customers");
            showToast(`Failed to fetch unverified customers: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    // Advanced Filtering Effect
    useEffect(() => {
        let result = customers;

        // Search Filter
        if (searchTerm) {
            result = result.filter(
                (customer) =>
                    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.phoneNumber?.includes(searchTerm)
            );
        }

        // Status Filter
        if (filterStatus !== "all") {
            result = result.filter((customer) =>
                filterStatus === "active"
                    ? customer.accountStatus.isActive
                    : !customer.accountStatus.isActive
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

        setFilteredCustomers(result);
    }, [searchTerm, filterStatus, sortConfig, customers]);

    // Pagination Logic
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(
        indexOfFirstCustomer,
        indexOfLastCustomer
    );

    // Initial Data Fetch
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Sorting handler
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    // Render Methods
    const renderCustomerTable = () => {

        return (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                {/* Search and Filter Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customers..."
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
                            <option value="all">All Customers</option>
                            <option value="active">Active Customers</option>
                            <option value="blocked">Blocked Customers</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                        <Users size={18} />
                        <span className="font-medium">
                            {filteredCustomers.length} Customers
                        </span>
                    </div>
                </div>


                {
                    (filteredCustomers.length === 0) ?
                        (
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="flex justify-center items-center p-12">
                                    <div className="text-center">
                                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {tabValue === 1
                                                ? "No Unverified Customers"
                                                : "No Customers Found"}
                                        </h3>
                                        <p className="text-gray-500">
                                            {tabValue === 1
                                                ? "There are currently no customers pending verification."
                                                : "No customers match your search criteria."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) :
                        (
                            <div className="overflow-scroll">
                                <table>
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {[
                                                { key: "name", label: "Customer Name" },
                                                { key: "email", label: "Email" },
                                                { key: "phoneNumber", label: "Phone" },
                                                { key: "createdAt", label: "Joined Date" },
                                                { key: "isVerified", label: "Verification" },
                                                { key: "walletBalance", label: "Wallet Balance" },
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
                                                                    className={`${sortConfig.key === column.key &&
                                                                        sortConfig.direction === "asc"
                                                                        ? "text-blue-600"
                                                                        : "text-gray-400"
                                                                        }`}
                                                                />
                                                                <ChevronDown
                                                                    size={14}
                                                                    className={`-mt-1 ${sortConfig.key === column.key &&
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
                                        {currentCustomers.map((customer) => (
                                            <tr
                                                key={customer._id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {customer.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{customer.email || "N/A"}</td>
                                                <td className="px-6 py-4 text-gray-600">{customer.phoneNumber}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(customer.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${customer.isVerified
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {customer.isVerified ? (
                                                            <CheckCircle2 size={14} />
                                                        ) : (
                                                            <AlertCircle size={14} />
                                                        )}
                                                        {customer.isVerified ? "Verified" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                                                        <Wallet size={14} />
                                                        R{customer.walletBalance.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => navigate(`/customers/${customer._id}`)}
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
                            </div>
                        )
                }

                {/* Pagination */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        Showing {indexOfFirstCustomer + 1} to{" "}
                        {Math.min(indexOfLastCustomer, filteredCustomers.length)} of{" "}
                        {filteredCustomers.length} customers
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={((currentPage === 1) || (filteredCustomers.length === 0))}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            disabled={
                                ((currentPage ===
                                Math.ceil(filteredCustomers.length / customersPerPage)) || (filteredCustomers.length === 0))
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

    const renderTabs = () => (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="customer management tabs"
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
                    label="All Customers"
                    icon={<Users size={18} />}
                    iconPosition="start"
                />
                <Tab
                    label="Pending Verification"
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
                    Customer Management
                </h1>
            </div>

            {renderTabs()}
            {loading ? <LoadingSpinner /> : renderCustomerTable()}
        </div>
    );
};

export default CustomerManagement;