import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import merchantService from "../services/merchantService";
import { toast } from "sonner";
import {
  UserCheck,
  UserX,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

const MerchantDetails = () => {
  const [merchantDetails, setMerchantDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { merchantId } = useParams();
  const navigate = useNavigate();

  // Fetch Merchant Details
  const fetchMerchantDetails = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getMerchantDetails(merchantId);
      console.log("response.data", response.data);
      setMerchantDetails(response.data);
    } catch (err) {
      setError("Failed to fetch merchant details");
      toast.error("Failed to fetch merchant details", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Verification Handler
  const handleVerification = async (status) => {
    try {
      await merchantService.verifyMerchant(merchantId, { status });
      toast.success(`Merchant ${status} successfully`);
      fetchMerchantDetails(); // Refresh details after verification
    } catch (err) {
      toast.error("Verification failed", {
        description: err.message,
      });
    }
  };

  // Status Change Handler
  const handleStatusChange = async (active) => {
    try {
      await merchantService.updateMerchantStatus(merchantId, { active });
      toast.success(
        `Merchant ${active ? "activated" : "suspended"} successfully`
      );
      fetchMerchantDetails(); // Refresh details after status change
    } catch (err) {
      toast.error("Failed to update merchant status", {
        description: err.message,
      });
    }
  };

  // Image Viewer
  const ImageViewer = ({ src, alt, label }) => (
    <div className="flex flex-col items-center">
      <img
        src={src}
        alt={alt}
        className="w-48 h-48 object-cover rounded-lg shadow-md mb-2"
      />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  // Initial Data Fetch
  useEffect(() => {
    fetchMerchantDetails();
  }, [merchantId]);

  // Loading State
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );

  // Error State
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  // Ensure data is loaded
  if (!merchantDetails) return null;

  const { merchant, shop } = merchantDetails;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          Merchant Details
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>
          {!merchant.isVerify && (
            <button
              onClick={() => handleVerification("approved")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <UserCheck className="mr-2" /> Verify Merchant
            </button>
          )}
        </div>
      </div>

      {/* Merchant Profile Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Merchant Profile
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <UserCheck className="mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Name</p>
                <p>{merchant.name}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <Mail className="mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Email</p>
                <p>{merchant.email}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <Phone className="mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Phone Number</p>
                <p>{merchant.phoneNo}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Address</p>
                <p>{merchant.address}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={merchant.profile.url}
              alt="Merchant Profile"
              className="w-64 h-64 object-cover rounded-full shadow-lg"
            />
            <div className="mt-4 flex items-center">
              {merchant.isVerify ? (
                <CheckCircle className="mr-2 text-green-500" />
              ) : (
                <XCircle className="mr-2 text-yellow-500" />
              )}
              <span
                className={`font-medium ${
                  merchant.isVerify ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {merchant.isVerify
                  ? "Verified Merchant"
                  : "Pending Verification"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Shop Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-medium mb-2">Shop Details</p>
            <p>
              <strong>Name:</strong> {shop.name}
            </p>
            <p>
              <strong>Business Category:</strong> {shop.businessCategory}
            </p>
            <p>
              <strong>Registration Number:</strong>{" "}
              {shop.businessRegistrationNumber}
            </p>
            <p>
              <strong>Established Date:</strong>{" "}
              {new Date(shop.establishedDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Shop Address</p>
            <p>{shop.address.street}</p>
            <p>
              {shop.address.city}, {shop.address.country}
            </p>
            <p>Postal Code: {shop.address.postalCode}</p>
            <p>
              <strong>Contact:</strong> {shop.contact.phoneNo}
            </p>
            <p>
              <strong>Contact Email:</strong> {shop.contact.email}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Bank Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <CreditCard className="mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Bank Name</p>
                <p>{merchant.bankInformation.bankName}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <FileText className="mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Account Holder</p>
                <p>{merchant.bankInformation.accountHolder}</p>
              </div>
            </div>
          </div>
          <div>
            <p>
              <strong>Account Number:</strong>{" "}
              {merchant.bankInformation.accountNumber}
            </p>
            <p>
              <strong>Branch Name:</strong>{" "}
              {merchant.bankInformation.branchName}
            </p>
            <p>
              <strong>Branch Code:</strong>{" "}
              {merchant.bankInformation.branchCode}
            </p>
          </div>
        </div>
      </div>

      {/* Document Verification Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Uploaded Documents
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ImageViewer
            src={merchant.govId.url}
            alt="Government ID"
            label="Government ID"
          />
          <ImageViewer
            src={merchant.businessLicense.url}
            alt="Business License"
            label="Business License"
          />
          <ImageViewer
            src={merchant.taxDocument.url}
            alt="Tax Document"
            label="Tax Document"
          />
          <ImageViewer
            src={merchant.profile.url}
            alt="Profile Picture"
            label="Profile Picture"
          />
        </div>
      </div>
    </div>
  );
};

export default MerchantDetails;
