"use client"
import { useState } from 'react';

const ProductDisplay = () => {
  // Sample product data with Nigeria-specific details
  const sampleProducts = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    description: `Premium quality product ${i + 1} with amazing features that Nigerians love.`,
    price: Math.floor(Math.random() * 100000) + 5000, // Random price between ₦5,000 and ₦100,000
    stock: Math.floor(Math.random() * 100),
    image: `https://placehold.co/100x100/e5e7eb/6b7280?text=Product+${i+1}`
  }));

  // Format price in Nigerian Naira
  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sampleProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sampleProducts.length / productsPerPage);

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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Stock</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100">
                  <img 
                    src={product.image} 
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
                  {formatNaira(product.price)}
                </td>
                <td className="px-4 py-3 border-b border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 50 ? 'bg-green-100 text-green-800' : 
                    product.stock > 10 ? 'bg-blue-100 text-blue-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Yellow Accent */}
      <div className="flex justify-center mt-5">
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