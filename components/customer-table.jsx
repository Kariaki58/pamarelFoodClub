"use client";
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiUser, FiMail, FiPhone, FiDollarSign, FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AffiliatesAdminPage = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    board: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch affiliates data
  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...filters
      }).toString();

      const res = await fetch(`/api/admin/affiliates?${queryParams}`);
      const data = await res.json();

      if (res.ok) {
        setAffiliates(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.error || 'Failed to fetch affiliates');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, [currentPage, searchTerm, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort affiliates
  const sortedAffiliates = [...affiliates].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    switch (status) {
      case 'active':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'inactive':
        bgColor = 'bg-red-100 text-red-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Plan badge component
  const PlanBadge = ({ plan }) => {
    let bgColor = '';
    switch (plan) {
      case 'basic':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case 'classic':
        bgColor = 'bg-purple-100 text-purple-800';
        break;
      case 'deluxe':
        bgColor = 'bg-indigo-100 text-indigo-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'None'}
      </span>
    );
  };

  // Board badge component
  const BoardBadge = ({ board }) => {
    let bgColor = '';
    switch (board) {
      case 'bronze':
        bgColor = 'bg-amber-100 text-amber-800';
        break;
      case 'silver':
        bgColor = 'bg-gray-100 text-gray-800';
        break;
      case 'gold':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'platinum':
        bgColor = 'bg-teal-100 text-teal-800';
        break;
      case 'exit':
        bgColor = 'bg-green-100 text-green-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {board ? board.charAt(0).toUpperCase() + board.slice(1) : 'None'}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ current, total, label }) => {
    const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span>{current}/{total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Affiliates Management</h1>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search affiliates..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiFilter />
            Filters
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.plan}
                onChange={(e) => handleFilterChange('plan', e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="classic">Classic</option>
                <option value="deluxe">Deluxe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.board}
                onChange={(e) => handleFilterChange('board', e.target.value)}
              >
                <option value="all">All Boards</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="exit">Exit</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Affiliates Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('username')}
                    >
                      <div className="flex items-center gap-1">
                        Affiliate
                        {sortConfig.key === 'username' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downlines
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Board Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Joined
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAffiliates.length > 0 ? (
                    sortedAffiliates.map((affiliate) => (
                      <tr key={affiliate._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{affiliate.username}</div>
                              <div className="text-sm text-gray-500">ID: {affiliate._id.toString().slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <FiMail />
                            {affiliate.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <FiPhone />
                            {affiliate.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PlanBadge plan={affiliate.currentPlan} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <BoardBadge board={affiliate.currentBoard} />
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(affiliate.boardProgress?.find(b => b.boardType === affiliate.currentBoard)?.startDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <FiUser className="text-blue-500" />
                              <span className="font-medium">{affiliate.directDownlines}</span> Direct
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <FiUsers className="text-purple-500" />
                              <span className="font-medium">{affiliate.indirectDownlines}</span> Indirect
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <FiTrendingUp className="text-green-500" />
                              <span className="font-medium">{affiliate.totalDownlines}</span> Total
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <ProgressBar 
                              current={affiliate.directReferrals} 
                              total={affiliate.boardRequirements.direct} 
                              label="Direct Referrals" 
                            />
                            <ProgressBar 
                              current={affiliate.indirectReferrals} 
                              total={affiliate.boardRequirements.indirect} 
                              label="Indirect Referrals" 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={affiliate.status} />
                          <div className="text-xs text-gray-500 mt-1">
                            {affiliate.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(affiliate.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No affiliates found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}
                    </span>{' '}
                    of <span className="font-medium">{totalPages * itemsPerPage}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AffiliatesAdminPage;