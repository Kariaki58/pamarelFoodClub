"use client";
import { useState, useEffect } from 'react';

const ProductDisplay = () => {
  // Format price in Nigerian Naira
  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const productsPerPage = 10;

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/product/inventory?page=${currentPage}&limit=${productsPerPage}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when page changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > maxVisiblePages - 2) {
        pageNumbers.push('...');
      }
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= maxVisiblePages - 2) {
        end = maxVisiblePages - 1;
      }
      
      if (currentPage >= totalPages - (maxVisiblePages - 3)) {
        start = totalPages - (maxVisiblePages - 2);
      }
      
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pageNumbers.push(i);
        }
      }
      
      if (currentPage < totalPages - (maxVisiblePages - 3)) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="w-full p-5 bg-gray-50 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-5 bg-gray-50">
      <div className="w-full overflow-x-auto mb-5 shadow-sm rounded-lg bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Price (₦)</th>
              {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Stock</th> */}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100">
                  <img 
                    src={product.images?.find(img => img.isDefault)?.url || '/placeholder-product.jpg'} 
                    alt={product.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                    loading="lazy"
                  />
                </td>
                <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3 border-b border-gray-100 max-w-xs truncate text-gray-700">
                  {product.description}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
                  {formatNaira(product.basePrice)}
                </td>
                {/* <td className="px-4 py-3 border-b border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 50 ? 'bg-green-100 text-green-800' : 
                    product.stock > 10 ? 'bg-blue-100 text-blue-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Yellow Accent */}
      <div className="flex justify-between items-center mt-5">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalItems)} of {totalItems} products
        </div>
        
        <nav>
          <ul className="flex flex-wrap gap-1 list-none p-0">
            <li className={`${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                onClick={() => paginate(currentPage - 1)} 
                className="flex items-center justify-center min-w-10 h-10 px-2 border border-amber-300 bg-white text-amber-700 rounded-lg hover:bg-amber-50 transition-all"
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            
            {getPageNumbers().map((number, index) => (
              <li 
                key={index} 
                className={`${number === currentPage ? 'bg-amber-500 border-amber-500 text-white' : ''} ${number === '...' ? 'pointer-events-none' : ''}`}
              >
                {number === '...' ? (
                  <span className="flex items-center justify-center min-w-10 h-10 px-2 border border-amber-300 bg-white text-gray-700 rounded-lg">
                    ...
                  </span>
                ) : (
                  <button 
                    onClick={() => paginate(number)} 
                    className={`flex items-center justify-center min-w-10 h-10 px-2 border ${number === currentPage ? 'border-amber-500' : 'border-amber-300'} ${number === currentPage ? 'bg-amber-500 text-white' : 'bg-white text-amber-700'} rounded-lg hover:bg-amber-50 transition-all`}
                  >
                    {number}
                  </button>
                )}
              </li>
            ))}
            
            <li className={`${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                className="flex items-center justify-center min-w-10 h-10 px-2 border border-amber-300 bg-white text-amber-700 rounded-lg hover:bg-amber-50 transition-all"
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ProductDisplay;