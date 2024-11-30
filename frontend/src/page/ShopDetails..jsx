import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Star, MapPin, Calendar, Phone, Mail, User } from 'lucide-react';
import { Shop } from '@mui/icons-material';
import shopService from '../services/shopService';
import productServices from '../services/productServices';
import LoadingSpinner from '../component/UI/LoadingSpinner';

const ShopDetails = () => {
  const { shopId } = useParams();
  const [shopDetails, setShopDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    Promise.all([
      shopService.getShopById(shopId),
      productServices.getAllProducts(shopId)
    ]).then(([shopResponse, productsResponse]) => {
        console.log('shopResponse.data.shop', shopResponse.data.shop)
      setShopDetails(shopResponse.data.shop);
      setProducts(productsResponse.data.products);
      setFilteredProducts(productsResponse.data.products);
      setLoading(false);
    }).catch(error => {
      console.error('Failed to fetch shop details', error);
      setLoading(false);
    });
  }, [shopId]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleSortProducts = (option) => {
    setSortOption(option);
    let sorted = [...filteredProducts];

    switch(option) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostSold':
        sorted.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'highestStock':
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="large" text="Loading shop details..." />
    </div>
  );
  if (!shopDetails) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-gray-500">
        <h2 className="text-xl font-semibold">Shop Not Found</h2>
        <p className="mt-2">The requested shop could not be found.</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
         Shop Details 
        </h1>
      </div>
      
      {/* Shop Details Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{shopDetails.name}</h1>
          <Shop className="text-blue-500" size={32} />
        </div>

        {/* Add Merchant Info Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Merchant Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="text-blue-500" size={20} />
              <span className="text-gray-700">
                <span className="font-medium">Name:</span> {shopDetails.merchantId.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="text-blue-500" size={20} />
              <span className="text-gray-700">
                <span className="font-medium">Email:</span> {shopDetails.merchantId.email}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center">
              <MapPin className="mr-3 text-gray-400" size={20} />
              <span>
                {shopDetails.address.street}, {shopDetails.address.city}, 
                {shopDetails.address.country}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-3 text-gray-400" size={20} />
              <span>
                Established: {new Date(shopDetails.establishedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-gray-600">
            <div className="flex items-center">
              <Phone className="mr-3 text-gray-400" size={20} />
              <span>{shopDetails.contact.phoneNo}</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-3 text-gray-400" size={20} />
              <span>{shopDetails.contact.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Business Info</h3>
          <p className="text-gray-600">{shopDetails.description}</p>
          <div className="mt-2 flex justify-between">
            <span>Category: {shopDetails.businessCategory}</span>
            <span>Reg. No: {shopDetails.businessRegistrationNumber}</span>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Package className="mr-3 text-blue-500" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Shop Products</h2>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={sortOption}
            onChange={(e) => handleSortProducts(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostSold">Most Sold</option>
            <option value="highestStock">Highest Stock</option>
          </select>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            {loading ? (
              <LoadingSpinner size="default" text="Filtering products..." />
            ) : (
              <div className="text-gray-500">No products found</div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.salesCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="text-yellow-500 mr-1" size={16} />
                        <span>{product.rating || 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetails;