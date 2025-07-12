"use client";
import { useState, useEffect } from 'react';
import { 
  FiCheck, 
  FiX, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiStar,
  FiAlertCircle,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 8;

// Generate dummy reviews data
const generateDummyReviews = () => {
  const statuses = ['pending', 'approved', 'rejected'];
  const ratings = [1, 2, 3, 4, 5];
  const products = [
    { id: 'prod_1', name: 'Wireless Headphones', image: 'https://picsum.photos/200/200?random=1' },
    { id: 'prod_2', name: 'Smart Watch Series 5', image: 'https://picsum.photos/200/200?random=2' },
    { id: 'prod_3', name: 'Bluetooth Speaker', image: 'https://picsum.photos/200/200?random=3' },
    { id: 'prod_4', name: 'Gaming Keyboard', image: 'https://picsum.photos/200/200?random=4' },
    { id: 'prod_5', name: '4K Camera', image: 'https://picsum.photos/200/200?random=5' },
  ];
  
  return Array.from({ length: 32 }, (_, i) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const date = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    return {
      id: `rev_${i + 1}`,
      product,
      customer: `Customer ${i + 1}`,
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      comment: [
        "Great product, works perfectly! I've been using it for a month now and it's exceeded all my expectations. The battery life is amazing and the sound quality is crisp and clear. Definitely worth the price.",
        "Average quality, could be better. The product looks nice but doesn't perform as well as I hoped. The battery drains quickly and the buttons are not very responsive.",
        "Exceeded my expectations. For the price, I wasn't expecting much but this product has surprised me with its quality and features. Highly recommend!",
        "Not worth the price. The product stopped working after just two weeks of use. Customer service was unhelpful in resolving my issue.",
        "Fast delivery, good packaging. The product arrived earlier than expected and was well-protected. The item itself works fine, though it's not exceptional.",
        "Stopped working after 2 weeks. I was really enjoying this product until it suddenly stopped functioning. Very disappointed with the durability.",
        "Perfect for my needs. I use this product daily and it performs exactly as described. The size is perfect and it's very easy to use.",
        "Would buy again. This is my second purchase of this item because the first one worked so well. The company has earned my loyalty with this great product."
      ][Math.floor(Math.random() * 8)],
      date: date.toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
};

export default function ReviewAdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState([]);

  // Load dummy reviews and check mobile status
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = generateDummyReviews();
      setReviews(data);
      setFilteredReviews(data);
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
    let result = [...reviews];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(review => 
        review.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(review => review.status === statusFilter);
    }
    
    // Apply rating filter
    if (ratingFilter !== 'all') {
      result = result.filter(review => review.rating === parseInt(ratingFilter));
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredReviews(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
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

  // Toggle review expansion
  const toggleExpandReview = (id) => {
    if (expandedReviews.includes(id)) {
      setExpandedReviews(expandedReviews.filter(reviewId => reviewId !== id));
    } else {
      setExpandedReviews([...expandedReviews, id]);
    }
  };

  // Approve review
  const approveReview = (id) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: 'approved' } : review
    ));
    toast.success('Review approved');
  };

  // Reject review
  const rejectReview = (id) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: 'rejected' } : review
    ));
    toast.error('Review rejected');
  };

  // Delete review
  const deleteReview = (id) => {
    setReviews(reviews.filter(review => review.id !== id));
    toast.success('Review deleted');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FiStar 
        key={i} 
        className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Review Management</h1>
            <p className="text-gray-600 mt-1">Manage and moderate customer reviews</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-medium">{filteredReviews.length}</span>
              <span className="text-gray-500 ml-1">Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reviews by customer, product or comment..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Reviews Table/Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {isMobile ? (
              // Mobile Cards View
              <div className="grid grid-cols-1 gap-4 mb-8">
                {paginatedReviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={review.product.image} 
                          alt={review.product.name} 
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{review.product.name}</h3>
                          <p className="text-sm text-gray-500">{review.customer}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        review.status === 'approved' ? 'bg-green-100 text-green-800' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      {expandedReviews.includes(review.id) 
                        ? review.comment 
                        : review.comment.length > 100 
                          ? `${review.comment.substring(0, 100)}...` 
                          : review.comment}
                    </p>
                    
                    {review.comment.length > 100 && (
                      <button 
                        onClick={() => toggleExpandReview(review.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-3"
                      >
                        {expandedReviews.includes(review.id) ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => approveReview(review.id)}
                            className="flex items-center text-sm text-green-600 hover:text-green-800"
                          >
                            <FiCheck className="mr-1" /> Approve
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => rejectReview(review.id)}
                            className="flex items-center text-sm text-red-600 hover:text-red-800"
                          >
                            <FiX className="mr-1" /> Reject
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={review.product.image} 
                              alt={review.product.name} 
                              className="h-10 w-10 rounded-md object-cover mr-3"
                            />
                            <div className="font-medium text-gray-900">{review.product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <p className={expandedReviews.includes(review.id) ? '' : 'line-clamp-2'}>
                            {review.comment}
                          </p>
                          {review.comment.length > 100 && (
                            <button 
                              onClick={() => toggleExpandReview(review.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                            >
                              {expandedReviews.includes(review.id) ? 'Read Less' : 'Read More'}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(review.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            review.status === 'approved' ? 'bg-green-100 text-green-800' :
                            review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            {review.status !== 'approved' && (
                              <button
                                onClick={() => approveReview(review.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <FiCheck />
                              </button>
                            )}
                            {review.status !== 'rejected' && (
                              <button
                                onClick={() => rejectReview(review.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <FiX />
                              </button>
                            )}
                            <button
                              onClick={() => deleteReview(review.id)}
                              className="text-gray-500 hover:text-red-500"
                              title="Delete"
                            >
                              <FiTrash2 />
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
            {filteredReviews.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length} reviews
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
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${currentPage === item ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
    </div>
  );
}