"use client";
import { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiPlus, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight, 
  FiDollarSign, 
  FiPackage, 
  FiTrendingUp, 
  FiAlertCircle,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

// Format numbers as Nigerian Naira with commas
const formatNaira = (amount) => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

// Generate dummy products data
const generateDummyProducts = () => {
  const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Sports'];
  const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  
  return Array.from({ length: 45 }, (_, i) => {
    const price = Math.floor(Math.random() * 50000) + 1000; // Prices in Naira
    const unitsSold = Math.floor(Math.random() * 100);
    const stock = Math.floor(Math.random() * 50);
    
    return {
      id: `prod_${i + 1}`,
      name: `Product ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price,
      dateUploaded: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      unitsSold,
      stock,
      revenue: price * unitsSold,
      status: stock > 10 ? statuses[0] : (stock > 0 ? statuses[1] : statuses[2]),
      image: `https://picsum.photos/200/200?random=${i}`
    };
  });
};

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('dateUploaded');
  const [filterOption, setFilterOption] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Load dummy products and check mobile status
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = generateDummyProducts();
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    }, 800);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...products];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterOption !== 'all') {
      result = result.filter(product => product.category === filterOption);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'dateUploaded':
        result.sort((a, b) => new Date(b.dateUploaded) - new Date(a.dateUploaded));
        break;
      case 'highestSelling':
        result.sort((a, b) => b.unitsSold - a.unitsSold);
        break;
      case 'lowestStock':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'revenue':
        result.sort((a, b) => b.revenue - a.revenue);
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchQuery, sortOption, filterOption]);

  // Calculate summary metrics
  const summaryMetrics = {
    totalProducts: products.length,
    totalRevenue: products.reduce((sum, product) => sum + product.revenue, 0),
    totalUnitsSold: products.reduce((sum, product) => sum + product.unitsSold, 0),
    totalOutOfStock: products.filter(product => product.status === 'Out of Stock').length
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate pagination items with ellipsis
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const leftBound = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const rightBound = Math.min(totalPages, leftBound + maxVisiblePages - 1);
    
    if (leftBound > 1) {
      items.push(1);
      if (leftBound > 2) items.push('...');
    }
    
    for (let i = leftBound; i <= rightBound; i++) {
      items.push(i);
    }
    
    if (rightBound < totalPages) {
      if (rightBound < totalPages - 1) items.push('...');
      items.push(totalPages);
    }
    
    return items;
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct({...product});
    toast.success(`Editing ${product.name}`);
    // In a real app, you would open a modal/form for editing
  };

  // Delete product confirmation
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Delete product
  const handleDelete = () => {
    setProducts(products.filter(p => p.id !== productToDelete.id));
    setShowDeleteModal(false);
    toast.success(`${productToDelete.name} deleted successfully`);
    setProductToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
          <button className="mt-4 md:mt-0 flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            <FiPlus className="mr-2" />
            Add New Product
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                    <FiPackage size={20} />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold truncate max-w-full break-words">
                    {summaryMetrics.totalProducts}
                    </p>
                </div>
                </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                    <FiDollarSign size={20} />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold truncate max-w-full break-words">
                    {formatNaira(summaryMetrics.totalRevenue)}
                    </p>
                </div>
                </div>
            </div>

            {/* Total Units Sold */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                    <FiTrendingUp size={20} />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Units Sold</p>
                    <p className="text-2xl font-semibold truncate max-w-full break-words">
                    {summaryMetrics.totalUnitsSold.toLocaleString()}
                    </p>
                </div>
                </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-50 text-red-600">
                    <FiAlertCircle size={20} />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-500">Out of Stock</p>
                    <p className="text-2xl font-semibold truncate max-w-full break-words">
                    {summaryMetrics.totalOutOfStock}
                    </p>
                </div>
                </div>
            </div>
            </div>

        
        {/* Filters and Search */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products by name or category..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <FiFilter className="text-gray-500 mr-2" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="dateUploaded">Date Uploaded</option>
                <option value="highestSelling">Highest Selling</option>
                <option value="lowestStock">Lowest Stock</option>
                <option value="revenue">Revenue Generated</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Products Table/Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {isMobile ? (
              // Mobile Cards View - Improved responsive layout
              <div className="grid grid-cols-1 gap-4 mb-8">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{product.category}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                            product.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                            product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Price</p>
                            <p className="font-semibold truncate">{formatNaira(product.price)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Uploaded</p>
                            <p className="truncate">{product.dateUploaded}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Sold</p>
                            <p>{product.unitsSold.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Stock</p>
                            <p>{product.stock.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-400">Revenue</p>
                            <p className="font-medium truncate">{formatNaira(product.revenue)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => confirmDelete(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-10 w-10 rounded-md object-cover mr-3"
                            />
                            <div className="font-medium text-gray-900">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatNaira(product.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.dateUploaded}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unitsSold.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatNaira(product.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                            product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(product)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {getPaginationItems().map((item, index) => (
                    item === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${currentPage === item ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {item}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <div className="flex items-center mb-4">
              <img 
                src={productToDelete?.image} 
                alt={productToDelete?.name} 
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-medium">{productToDelete?.name}</p>
                <p className="text-sm text-gray-500">{productToDelete?.category}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}