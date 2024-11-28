import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingCart
} from 'lucide-react';

// Dummy data matching the schema (same as previous implementation)
const dummyProducts = [
  {
    _id: '1',
    shopId: 'shop123',
    name: 'Vintage Leather Jacket',
    description: 'Classic brown leather jacket with vintage detailing',
    price: 299.99,
    category: 'Clothing',
    tags: ['leather', 'vintage', 'jacket'],
    status: 'active',
    stock: 15,
    images: [
      { 
        url: 'https://images.unsplash.com/photo-1486648855265-390f3951358d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        public_id: 'jacket_image_1' 
      }
    ],
    specifications: {
      weight: '1.2 kg',
      dimensions: '40x30x5 cm',
      material: 'Genuine Leather',
      color: 'Brown',
      brand: 'Vintage Classics'
    },
    ratings: [
      {
        rating: 4,
        customerId: 'customer1',
        review: 'Great quality jacket!',
        createdAt: new Date()
      }
    ],
    salesCount: 42
  },
  {
    _id: '2',
    shopId: 'shop123',
    name: 'Smart Wireless Headphones',
    description: 'Noise-cancelling wireless headphones with long battery life',
    price: 199.50,
    category: 'Electronics',
    tags: ['wireless', 'headphones', 'noise-cancelling'],
    status: 'active',
    stock: 30,
    images: [
      { 
        url: 'https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        public_id: 'headphones_image_1' 
      }
    ],
    specifications: {
      weight: '0.3 kg',
      dimensions: '20x15x10 cm',
      material: 'Plastic and Metal',
      color: 'Black',
      brand: 'TechSound'
    },
    ratings: [
      {
        rating: 5,
        customerId: 'customer2',
        review: 'Amazing sound quality!',
        createdAt: new Date()
      }
    ],
    salesCount: 78
  }
];

const ProductsPage = () => {
  const [products, setProducts] = useState(dummyProducts);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBySales, setSortBySales] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleProductView = (productId) => {
    console.log(`Viewing product ${productId}`);
  };

  const handleProductEdit = (productId) => {
    console.log(`Editing product ${productId}`);
  };

  const handleProductDelete = (productId) => {
    setProducts(products.filter(product => product._id !== productId));
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length 
        ? [] 
        : products.map(product => product._id)
    );
  };

  const filteredProducts = products.filter(product => {
    return (
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      product.price >= minPrice &&
      product.price <= maxPrice &&
      (selectedStatus ? product.status === selectedStatus : true)
    );
  });

  const sortedProducts = sortBySales ? [...filteredProducts].sort((a, b) => b.salesCount - a.salesCount) : filteredProducts;

  return (
    <div className="bg-gradient-to-br w-full to-white min-h-screen p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-indigo-800 mb-3 tracking-tight">Products</h1>
            <p className="text-gray-600 text-lg">Manage and track your product inventory</p>
          </div>
          
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center space-x-4">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
              <button 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="mr-2" size={16} />
                Filters
                {isFilterExpanded ? <ChevronUp className="ml-2" size={16} /> : <ChevronDown className="ml-2" size={16} />}
              </button>
            </div>

            {isFilterExpanded && (
              <div className="grid grid-cols-4 gap-4">
                <select 
                  onChange={(e) => setSelectedStatus(e.target.value)} 
                  value={selectedStatus} 
                  className="border border-gray-300 px-4 py-3 rounded-lg text-gray-700"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-700"
                  />
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-700"
                  />
                </div>
                <button 
                  onClick={() => setSortBySales(prev => !prev)} 
                  className="flex items-center justify-center border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sort by Sales {sortBySales ? <ChevronDown className="ml-2" /> : <ChevronUp className="ml-2" />}
                </button>
              </div>
            )}
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-red-50 p-4 rounded-lg">
              <div className="text-red-700">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </div>
              <button 
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => {
                  setProducts(products.filter(
                    product => !selectedProducts.includes(product._id)
                  ));
                  setSelectedProducts([]);
                }}
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Products Table or No Products State */}
        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <Package className="mx-auto mb-6 text-indigo-500" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Products Found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus || (minPrice > 0 || maxPrice < 500) 
                ? "No products match your current filters." 
                : "You haven't added any products yet."}
            </p>
            
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="form-checkbox text-indigo-600 rounded"
                    />
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.includes(product._id)} 
                        onChange={() => handleSelectProduct(product._id)}
                        className="form-checkbox text-indigo-600 rounded"
                      />
                    </td>
                    <td className="p-4 flex items-center space-x-4">
                      <img 
                        src={product.images[0].url} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 font-semibold text-indigo-600">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        product.stock > 20 ? 'bg-green-100 text-green-800' : 
                        product.stock > 10 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 flex space-x-2">
                      <button 
                        onClick={() => handleProductView(product._id)} 
                        className="text-indigo-500 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => handleProductEdit(product._id)} 
                        className="text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-colors"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleProductDelete(product._id)} 
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
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

export default ProductsPage;