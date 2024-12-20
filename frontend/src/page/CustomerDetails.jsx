import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
    UserCheck,
    UserX,
    Phone,
    Mail,
    MapPin,
    Download,
    AlertCircle,
    CheckCircle,
    XCircle,
    CheckCircle2,
    Wallet,
    ShoppingBag,
    History,
    X
} from "lucide-react";
import customerService from "../services/customerService";
import OrderList from "../component/CustomerDetails/CustomerOrders";
import TransactionList from "../component/CustomerDetails/CustomerWalletTransactions";
import { useToast } from "../context/ToastContext";

// Image Modal Component
const ImageModal = ({ src, alt, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative max-w-[90%] max-h-[90%] w-auto h-auto">
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                >
                    <X size={32} />
                </button>
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
};

// PDF Export Button Component
const PDFExportButton = ({ targetRef }) => {
    const showToast = useToast()
    const downloadPDF = async () => {
        if (!targetRef.current) return;

        try {
            const canvas = await html2canvas(targetRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: null,
            });

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const pdf = new jsPDF({
                orientation: imgWidth > imgHeight ? "l" : "p",
                unit: "px",
                format: [imgWidth, imgHeight],
            });

            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");
            pdf.save(`Customer_Details_Export.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            showToast("Failed to export PDF. Please try again later.", "error");
        }
    };

    return (
        <button
            onClick={downloadPDF}
            className="fixed bottom-4 right-8 flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 font-bold transition-colors"
        >
            <Download className="mr-2" size={20} /> Export as PDF
        </button>
    );
};

const CustomerDetails = () => {

    const showToast = useToast()

    const [customerDetails, setCustomerDetails] = useState(null);
    const [orders, setOredrs] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [deactivationReason, setDeactivationReason] = useState("");
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const { customerId } = useParams();
    const navigate = useNavigate();
    const mainContainerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('orders');


    console.log(orders)

    // Fetch customer details
    const fetchCustomerDetails = async () => {
        try {
            setLoading(true);
            // Replace with your actual service call
            const response = await customerService.getCustomerDetails(customerId);
            console.log(response)
            setCustomerDetails(response.data.customer);
            setOredrs(response.data.orders);
        } catch (err) {
            setError("Failed to fetch customer details");
            showToast(`Failed to fetch customer details: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle verification status change
    const handleVerification = async () => {
        try {
            // await customerService.verifyCustomer(customerId, !customerDetails.isVerified);
            // showToast(`Customer ${customerDetails.isVerified ? 'unverified' : 'verified'} successfully`, "success");
            fetchCustomerDetails();
            setIsVerificationModalOpen(false);
        } catch (err) {
            showToast(`Verification status update failed: ${err.message}`, "error");
        }
    };

    // Handle account status change
    const handleAccountStatusChange = async () => {
        if (!customerDetails.accountStatus.isActive && !deactivationReason) {
            showToast("Please provide a reason for deactivation", "error");
            return;
        }

        try {
            await customerService.updateCustomerStatus(customerId, !customerDetails.accountStatus.isActive, deactivationReason);
            showToast(`Account ${customerDetails.accountStatus.isActive ? 'deactivated' : 'activated'} successfully`, "success");
            fetchCustomerDetails();
            setIsDeactivateModalOpen(false);
            setDeactivationReason("");
        } catch (err) {
            showToast(`Status update failed: ${err.message}`, "error");
        }
    };

    useEffect(() => {
        fetchCustomerDetails();
    }, [customerId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!customerDetails) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Customer Details</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Back to List
                    </button>

                    {!customerDetails.isVerified ? (
                        <button
                            onClick={() => setIsVerificationModalOpen(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                        >
                            <CheckCircle2 className="mr-2" /> Verify Customer
                        </button>
                    ) : customerDetails.accountStatus.isActive ? (
                        <button
                            onClick={() => setIsDeactivateModalOpen(true)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                        >
                            <UserX className="mr-2" /> Deactivate Account
                        </button>
                    ) : (
                        <button
                            onClick={handleAccountStatusChange}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                        >
                            <UserCheck className="mr-2" /> Activate Account
                        </button>
                    )}
                </div>
            </div>

            <div ref={mainContainerRef} className="p-2">
                {/* Customer Profile Section */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                        Customer Profile
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center mb-4">
                                <UserCheck className="mr-3 text-blue-500" />
                                <div>
                                    <p className="font-medium">Name</p>
                                    <p>{customerDetails.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center mb-4">
                                <Mail className="mr-3 text-blue-500" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p>{customerDetails.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center mb-4">
                                <Phone className="mr-3 text-blue-500" />
                                <div>
                                    <p className="font-medium">Phone Number</p>
                                    <p>{customerDetails.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center mb-4">
                                <MapPin className="mr-3 text-blue-500" />
                                <div>
                                    <p className="font-medium">Address</p>
                                    <p>
                                        {customerDetails?.address?.street}, {customerDetails?.address?.city}
                                        <br />
                                        {customerDetails?.address?.postalCode}, {customerDetails.address?.country}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center mb-4">
                                <Wallet className="mr-3 text-blue-500" />
                                <div>
                                    <p className="font-medium">Wallet Balance</p>
                                    <p>${customerDetails?.walletBalance?.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative flex flex-col items-center">
                            <img
                                src={customerDetails?.profile?.url}
                                alt="Customer Profile"
                                className="w-64 h-64 object-cover rounded-full shadow-lg cursor-pointer"
                                onClick={() => setSelectedImage({
                                    src: customerDetails?.profile?.url,
                                    alt: "Customer Profile"
                                })}
                            />
                            {!customerDetails?.accountStatus?.isActive && (
                                <div className="absolute top-2 right-2 bg-red-100 px-3 py-1 rounded-full flex items-center">
                                    <UserX className="text-red-600 mr-1" size={16} />
                                    <span className="text-red-600 font-medium">Deactivated</span>
                                </div>
                            )}
                            <div className="mt-4 flex items-center">
                                {customerDetails.isVerified ? (
                                    <CheckCircle className="mr-2 text-green-500" />
                                ) : (
                                    <XCircle className="mr-2 text-yellow-500" />
                                )}
                                <span className={`font-medium ${customerDetails.isVerified ? "text-green-600" : "text-yellow-600"
                                    }`}>
                                    {customerDetails.isVerified ? "Verified Customer" : "Unverified"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Orders and Transactions */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex border-b mb-4">
                        <button
                            className={`px-4 py-2 ${activeTab === 'orders'
                                    ? 'border-b-2 border-blue-500 text-blue-500'
                                    : 'text-gray-500'
                                }`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingBag className="inline mr-2" size={20} />
                            Orders
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'transactions'
                                    ? 'border-b-2 border-blue-500 text-blue-500'
                                    : 'text-gray-500'
                                }`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            <History className="inline mr-2" size={20} />
                            Transactions
                        </button>
                    </div>

                    {activeTab === 'orders' ? (
                        <OrderList orders={orders} />
                    ) : (
                        <TransactionList customerId={customerId} />
                    )}
                </div>
            </div>

            {/* Verification Modal */}
            {isVerificationModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-[480px] max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {customerDetails.isVerified ? 'Remove Verification' : 'Verify Customer'}
                        </h2>
                        <p className="mb-6">
                            Are you sure you want to {customerDetails.isVerified ? 'remove verification from' : 'verify'} this customer?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsVerificationModalOpen(false)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerification}
                                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivation Modal */}
            {isDeactivateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-[480px] max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">Deactivate Account</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Deactivation
                            </label>
                            <textarea
                                className="w-full p-2 border rounded-lg"
                                rows="3"
                                value={deactivationReason}
                                onChange={(e) => setDeactivationReason(e.target.value)}
                                placeholder="Please provide a reason for deactivation..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeactivateModalOpen(false)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccountStatusChange}
                                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                Confirm Deactivation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedImage && (
                <ImageModal
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            <PDFExportButton targetRef={mainContainerRef} />
        </div>
    );
};

export default CustomerDetails;