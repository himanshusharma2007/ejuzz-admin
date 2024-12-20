import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Clock } from 'lucide-react';
import customerService from '../../services/customerService';

const TransactionList = ({ customerId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Replace with your actual service call
        const response = await customerService.getCustomerTransactions(customerId);
        console.log(response)
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [customerId]);

  console.log(transactions)

  // Get current transactions
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions?.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Calculate total pages
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const TransactionIcon = ({ type }) => {
    switch (type) {
      case 'ADD':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'TRANSFER':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From/To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTransactions?.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <TransactionIcon type={transaction?.transactionType} />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {transaction.transactionType}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    transaction.transactionType === 'ADD'
                      ? 'text-green-600'
                      : transaction.transactionType === 'WITHDRAW'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    R{transaction.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.transactionType === 'TRANSFER' ? (
                      <>
                        <div>From: {transaction?.from?.name}</div>
                        <div>To: {transaction?.to?.name}</div>
                      </>
                    ) : (
                      transaction.fromModel || transaction.toModel
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(transaction.createdAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
          <p className="mt-1 text-sm text-gray-500">
            This customer hasn't made any transactions yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;