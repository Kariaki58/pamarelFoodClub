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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

// Format numbers as Nigerian Naira with commas
const formatNaira = (amount) => {
  return `₦${amount?.toLocaleString('en-NG') || '₦0'}`;
};

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [filterOption, setFilterOption] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categories, setCategories] = useState([]);

  const router = useRouter();

  // Calculate product metrics based on variants
  const calculateProductMetrics = (product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    
    // Price range
    const minPrice = hasVariants ? product.minPrice : product.basePrice;
    const maxPrice = hasVariants ? product.maxPrice : product.basePrice;
    
    // Total stock
    const totalStock = hasVariants ? product.totalStock : product.stock || 0;
    
    // Total units sold (sum of all variants if available)
    const totalUnitsSold = hasVariants 
      ? product.variants.reduce((sum, variant) => sum + (variant.unitsSold || 0), 0)
      : product.unitsSold || 0;
    
    // Total revenue
    const totalRevenue = hasVariants
      ? product.variants.reduce((sum, variant) => sum + (variant.price * (variant.unitsSold || 0)), 0)
      : (product.basePrice || product.price || 0) * totalUnitsSold;

    return {
      minPrice,
      maxPrice,
      totalStock,
      totalUnitsSold,
      totalRevenue,
      hasVariants,
      variantCount: hasVariants ? product.variants.length : 0
    };
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/product/inventory?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
      
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      
      if (filterOption !== 'all') {
        url += `&category=${filterOption}`;
      }
      
      url += `&sortBy=${sortOption}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalItems);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      const data = await response.json();
      if (data.message) {
        setCategories(data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Initial load and check mobile status
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refetch when filters or pagination changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, sortOption, filterOption]);

  // Calculate summary metrics
  const summaryMetrics = {
    totalProducts: totalCount,
    totalRevenue: products.reduce((sum, product) => {
      const metrics = calculateProductMetrics(product);
      return sum + metrics.totalRevenue;
    }, 0),
    totalUnitsSold: products.reduce((sum, product) => {
      const metrics = calculateProductMetrics(product);
      return sum + metrics.totalUnitsSold;
    }, 0),
    totalOutOfStock: products.filter(product => {
      const metrics = calculateProductMetrics(product);
      return metrics.totalStock <= 0;
    }).length,
    productsWithVariants: products.filter(product => 
      product.variants && product.variants.length > 0
    ).length
  };

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
    router.push(`/admin/products/edit/${product._id}`);
  };

  // Delete product confirmation
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Delete product
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/product/${productToDelete._id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`${productToDelete.name} deleted successfully`);
        fetchProducts(); // Refresh the list
        setShowDeleteModal(false);
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  // Display price range for products with variants
  const displayPrice = (product) => {
    const metrics = calculateProductMetrics(product);
    if (metrics.hasVariants && metrics.minPrice !== metrics.maxPrice) {
      return `${formatNaira(metrics.minPrice)} - ${formatNaira(metrics.maxPrice)}`;
    }
    return formatNaira(metrics.minPrice);
  };

  // Display stock status
  const getStockStatus = (product) => {
    const metrics = calculateProductMetrics(product);
    if (metrics.totalStock > 10) return { status: 'In Stock', class: 'bg-green-100 text-green-800' };
    if (metrics.totalStock > 0) return { status: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Out of Stock', class: 'bg-red-100 text-red-800' };
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
          <Link href="/admin/products/new" className="mt-4 md:mt-0 flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            <FiPlus className="mr-2" />
            Add New Product
          </Link>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

          {/* Products with Variants */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <FiPackage size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">With Variants</p>
                <p className="text-2xl font-semibold truncate max-w-full break-words">
                  {summaryMetrics.productsWithVariants}
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
                placeholder="Search products by name or description..."
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
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="createdAt">Date Uploaded</option>
                <option value="unitsSold">Highest Selling</option>
                <option value="totalStock">Lowest Stock</option>
                <option value="basePrice">Base Price</option>
                <option value="name">Name</option>
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
              // Mobile Cards View
              <div className="grid grid-cols-1 gap-4 mb-8">
                {products.map((product) => {
                  const metrics = calculateProductMetrics(product);
                  const stockStatus = getStockStatus(product);
                  
                  return (
                    <div key={product._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <img 
                            src={product.images?.find(img => img.isDefault)?.url || '/placeholder-product.jpg'} 
                            alt={product.name} 
                            className="h-20 w-20 rounded-md object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                              <p className="text-sm text-gray-500 truncate">{product.category?.name}</p>
                              {metrics.hasVariants && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {metrics.variantCount} variants
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${stockStatus.class}`}>
                              {stockStatus.status}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-gray-400">Price</p>
                              <p className="font-semibold truncate">{displayPrice(product)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Uploaded</p>
                              <p className="truncate">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Sold</p>
                              <p>{metrics.totalUnitsSold.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Stock</p>
                              <p>{metrics.totalStock.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-400">Revenue</p>
                              <p className="font-medium truncate">
                                {formatNaira(metrics.totalRevenue)}
                              </p>
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
                  );
                })}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const metrics = calculateProductMetrics(product);
                      const stockStatus = getStockStatus(product);
                      
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={product.images?.find(img => img.isDefault)?.url || '/placeholder-product.jpg'} 
                                alt={product.name} 
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                {product.section && (
                                  <div className="text-xs text-gray-500 capitalize">{product.section}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            {displayPrice(product)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.hasVariants ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {metrics.variantCount} variants
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.totalUnitsSold.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.totalStock.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            {formatNaira(metrics.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.class}`}>
                              {stockStatus.status}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalCount > ITEMS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} products
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
                src={productToDelete?.images?.find(img => img.isDefault)?.url || '/placeholder-product.jpg'} 
                alt={productToDelete?.name} 
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-medium">{productToDelete?.name}</p>
                <p className="text-sm text-gray-500">{productToDelete?.category?.name}</p>
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