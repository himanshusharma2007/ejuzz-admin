import api from "./api";

const customerService = {
    // Fetch all customers with optional filters and pagination
    getAllCustomers: async (filters = {}) => {
        try {
            const response = await api.get("/customers", { params: filters });
            return response.data;
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error.response?.data || error.message;
        }
    },

    // Fetch customer details by ID
    getCustomerDetails : async (customerId) => {
        try {
            const response = await api.get(`/customers/${customerId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching customer details:", error);
            throw error.response?.data || error.message;
        }
    },

    // Update a customer's status (activate/suspend)
    updateCustomerStatus : async (customerId, active, reason) => {
        try {
            const response = await api.patch(`/customers/${customerId}/status`, {
                active,
                reason,
            });
            return response.data;
        } catch (error) {
            console.error("Error updating customer status:", error);
            throw error.response?.data || error.message;
        }
    },

    // Fetch a customer's wallet transactions
    getCustomerTransactions : async (customerId) => {
        try {
            const response = await api.get(`/customers/${customerId}/transactions`);
            return response.data;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error.response?.data || error.message;
        }
    },

    // Update a customer's wallet balance
    updateWalletBalance : async (customerId, adjustment, reason) => {
        try {
            const response = await api.patch(`/customers/${customerId}/wallet`, {
                adjustment,
                reason,
            });
            return response.data;
        } catch (error) {
            console.error("Error updating wallet balance:", error);
            throw error.response?.data || error.message;
        }
    }

};

export default customerService;