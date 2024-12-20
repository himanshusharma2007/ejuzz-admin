import React, { useState, useEffect } from 'react';
import { fetchAllTransactions, fetchTransactionStats } from '../services/transactionService';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    transactionType: 'ALL',
    dateRange: 'ALL',
    search: '',
    userType: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      const response = await fetchAllTransactions(filters);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchTransactionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Transaction Management</h1>
        
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Total Transactions</h3>
              <p className="text-2xl">{stats.totalTransactions[0]?.count || 0}</p>
            </div>
            {stats.transactionsByType.map(type => (
              <div key={type._id} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold">{type._id}</h3>
                <p className="text-2xl">{type.count}</p>
                <p className="text-sm text-gray-600">₹{type.totalAmount}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="border p-2 rounded"
              value={filters.transactionType}
              onChange={(e) => setFilters({...filters, transactionType: e.target.value, page: 1})}
            >
              <option value="ALL">All Types</option>
              <option value="ADD">Add</option>
              <option value="WITHDRAW">Withdraw</option>
              <option value="TRANSFER">Transfer</option>
            </select>

            <select
              className="border p-2 rounded"
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value, page: 1})}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>

            <select
              className="border p-2 rounded"
              value={filters.userType}
              onChange={(e) => setFilters({...filters, userType: e.target.value, page: 1})}
            >
              <option value="">All Users</option>
              <option value="customer">Customers</option>
              <option value="merchant">Merchants</option>
            </select>

            <input
              type="text"
              placeholder="Search..."
              className="border p-2 rounded"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{transaction.transactionType}</td>
                  <td className="px-6 py-4">{transaction.from?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{transaction.to?.name || 'N/A'}</td>
                  <td className="px-6 py-4">₹{transaction.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <div>
            Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              disabled={filters.page === 1}
              onClick={() => setFilters({...filters, page: filters.page - 1})}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              disabled={filters.page === pagination.pages}
              onClick={() => setFilters({...filters, page: filters.page + 1})}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};