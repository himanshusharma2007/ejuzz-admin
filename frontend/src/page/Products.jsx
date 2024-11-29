import { useState, useEffect } from 'react';
import productServices from '../services/productServices';
import { useToast } from '../context/ToastContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const showToast = useToast();

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productServices.getAllProducts();
      setProducts(data);
    } catch (error) {
      setError(error.message);
      showToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await productServices.removeProduct(productId);
      showToast('Product deleted successfully', 'success');
      // Refresh the products list
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  // View product details
  const handleViewProduct = async (productId) => {
    try {
      const productDetails = await productServices.getProductById(productId);
      // Handle displaying product details (you can use a modal or navigate to details page)
      console.log(productDetails);
    } catch (err) {
      showToast('Failed to fetch product details', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover mb-4 rounded"
              />
            )}
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold mb-4">${product.price}</p>
            
            <div className="flex justify-between">
              <button
                onClick={() => handleViewProduct(product._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Details
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No products found
        </div>
      )}
    </div>
  );
};

export default Products;