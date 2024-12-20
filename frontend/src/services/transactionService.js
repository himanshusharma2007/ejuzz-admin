import api from "./api";

// Fetch all transactions with filters and pagination
export const getAllTransactions = async (filters = {}) => {
  try {
    const response = await api.get("/transactions", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error.response?.data || error.message;
  }
};

// Fetch transactions for a specific user
export const getUserTransactions = async (userId, userType, filters = {}) => {
  try {
    const response = await api.get(`/transactions/user/${userId}/${userType}`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    throw error.response?.data || error.message;
  }
};

// Fetch transaction statistics
export const getTransactionStats = async () => {
  try {
    const response = await api.get("/transactions/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    throw error.response?.data || error.message;
  }
};

// Export transactions
export const exportTransactions = async (filters = {}) => {
  try {
    const response = await api.get("/transactions/export", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting transactions:", error);
    throw error.response?.data || error.message;
  }
};
