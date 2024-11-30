import React, { useState, useEffect } from 'react';
import { Search, Filter, ListFilter, Building2, Phone, Mail, Star } from 'lucide-react';
import shopService from '../services/shopService';
import { useNavigate } from 'react-router-dom';

const ShopsList = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
  }, [currentPage]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await shopService.getAllShops({
        page: currentPage,
        limit: 10
      });

      setShops(response.data.shops);
      setFilteredShops(response.data.shops);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch shops', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = shops.filter(shop => 
      shop.name.toLowerCase().includes(term) ||
      shop.merchantId.name.toLowerCase().includes(term) ||
      shop.address.city.toLowerCase().includes(term)
    );

    setFilteredShops(filtered);
  };

  const handleSort = (option) => {
    setSortOption(option);
    let sorted = [...filteredShops];

    switch(option) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostProducts':
        sorted.sort((a, b) => b.products.length - a.products.length);
        break;
      default:
        break;
    }

    setFilteredShops(sorted);
  };

  const handleShopClick = (shopId) => {
    navigate(`/shops/${shopId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Shops Management</h1>

      <div className="flex justify-between mb-6">
        <div className="relative flex-grow mr-4">
          <input 
            type="text" 
            placeholder="Search shops by name, merchant, or city" 
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <select 
              value={sortOption}
              onChange={(e) => handleSort(e.target.value)}
              className="appearance-none bg-white border rounded-lg pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostProducts">Most Products</option>
            </select>
            <ListFilter className="absolute right-2 top-3 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading shops...</div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No shops found</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map(shop => (
            <div 
              key={shop._id} 
              onClick={() => handleShopClick(shop._id)}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{shop.name}</h2>
                <Building2 className="text-blue-500" size={24} />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Merchant:</strong> {shop.merchantId.name}</p>
                <p><strong>Category:</strong> {shop.businessCategory}</p>
                <p className="flex items-center">
                  <Mail className="mr-2 text-gray-400" size={16} />
                  {shop.contact.email}
                </p>
                <p className="flex items-center">
                  <Phone className="mr-2 text-gray-400" size={16} />
                  {shop.contact.phoneNo}
                </p>
                <p className="flex items-center">
                  <Star className="mr-2 text-yellow-500" size={16} />
                  {shop.ratings.length} Reviews
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === index + 1 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopsList;