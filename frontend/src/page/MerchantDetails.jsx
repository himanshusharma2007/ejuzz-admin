import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import merchantService from "../services/merchantService";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
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
import { X, ZoomIn } from "lucide-react";

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

const PDFExportButton = ({ targetRef }) => {
  const downloadPDF = async () => {
    // Ensure the target element exists
    if (!targetRef.current) return;

    try {
      // Increase scale and quality of canvas
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null, // Transparent background
      });

      // Get canvas dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with matching aspect ratio
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "l" : "p",
        unit: "px",
        format: [imgWidth, imgHeight],
      });

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");

      // Save PDF
      pdf.save(`Merchant_Details_Export.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export PDF", {
        description: "Please try again later.",
      });
    }
  };
  return (
    <button
      onClick={downloadPDF}
      className="fixed bottom-4 right-8 flex items-center px-4 py-2 bg-blue-500 text-white rounded-full  hover:bg-blue-600 font-bold transition-colors"
    >
      <Download className="mr-2" size={20} /> Export as PDF
    </button>
  );
};

const MerchantDetails = () => {
  const [merchantDetails, setMerchantDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  const [verifying, setVerifying] = useState(false);

  const ImageViewer = ({ src, alt, label }) => (
    <div
      className="flex flex-col items-center cursor-pointer group relative"
      onClick={() => setSelectedImage({ src, alt })}
    >
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className="w-48 h-48 object-cover rounded-lg shadow-md mb-2 group-hover:opacity-70 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn
            className="text-white bg-black/50 rounded-full p-2"
            size={40}
          />
        </div>
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
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
    setVerifying(true);
    try {
      await merchantService.verifyMerchant(merchantId, { status });
      toast.success(`Merchant ${status} successfully`);
      fetchMerchantDetails(); // Refresh details after verification
    } catch (err) {
      toast.error("Verification failed", {
        description: err.message,
      });
    } finally {
      setVerifying(false);
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
        <div className="flex   justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 mr-3 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>

          <div className="flex ">
            {!merchant.isVerify ? (
              <button
                onClick={() => handleVerification("approved")}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                disabled={verifying}
              >
                {verifying ? "Verifying..." : <UserCheck className="mr-2" />} Verify Merchant
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
              >
                <UserCheck className="mr-2" /> Block Merchant
              </button>
            )}
          </div>
        </div>
      </div>
      <div ref={mainContainerRef} className="p-2">
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
                <div className="flex space-x-2">
                  <p className="font-medium">Address</p>
                  <p>{merchant.address?.postalCode}</p>
                  <p>{merchant.address?.street}</p>
                  <p>{merchant.address?.city}</p>
                  <p>{merchant.address?.country}</p>
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
            <div className="">
              <p className="font-medium mb-2">Shop Contact Details</p>
              <div className="flex space-x-2">

              <p className="font-bold ">Shop Address:</p>
              <p> {shop.address.postalCode}</p>
              <p>{shop.address.street}</p>
              <p>
                {shop.address.city}, {shop.address.country}
              </p>
              </div>
              <div>
              {" "}
              <p>
                <strong>Contact:</strong> {shop.contact.phoneNo}
              </p>
              <p>
                <strong>Contact Email:</strong> {shop.contact.email}
              </p>
            </div>
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

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            src={selectedImage.src}
            alt={selectedImage.alt}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
      {/* Existing buttons */}
      <PDFExportButton targetRef={mainContainerRef} />
    </div>
  );
};

export default MerchantDetails;
