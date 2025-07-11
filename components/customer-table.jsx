"use client";
import { ArrowLeftFromLine, ArrowRightToLine } from 'lucide-react';
import React, { useState } from 'react';


const customerData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    type: "customer",
    membershipLevel: "standard",
    status: "active",
    signupDate: "2023-01-15",
    lastPurchase: "2024-05-20",
    totalSpent: 1250,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    type: "affiliate",
    plan: "basic",
    status: "active",
    signupDate: "2023-02-10",
    lastPurchase: "2024-06-05",
    totalSpent: 3200,
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    type: "customer",
    membershipLevel: "basic",
    status: "inactive",
    signupDate: "2023-03-22",
    lastPurchase: "2024-01-15",
    totalSpent: 850,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@example.com",
    type: "affiliate",
    plan: "premium",
    status: "active",
    signupDate: "2023-04-05",
    lastPurchase: "2024-06-12",
    totalSpent: 5800,
  },
  {
    id: 5,
    name: "Robert Wilson",
    email: "robert.w@example.com",
    type: "customer",
    membershipLevel: "basic",
    status: "pending",
    signupDate: "2023-05-18",
    lastPurchase: "2024-03-10",
    totalSpent: 420,
  },
  {
    id: 6,
    name: "Jennifer Lee",
    email: "jennifer.l@example.com",
    type: "affiliate",
    plan: "classic",
    status: "active",
    signupDate: "2023-06-30",
    lastPurchase: "2024-06-18",
    totalSpent: 3900,
  },
  {
    id: 7,
    name: "David Kim",
    email: "david.k@example.com",
    type: "customer",
    membershipLevel: "premium",
    status: "active",
    signupDate: "2023-07-12",
    lastPurchase: "2024-05-28",
    totalSpent: 1750,
  },
  {
    id: 8,
    name: "Lisa Wong",
    email: "lisa.w@example.com",
    type: "affiliate",
    plan: "basic",
    status: "inactive",
    signupDate: "2023-08-25",
    lastPurchase: "2024-02-14",
    totalSpent: 2100,
  },
  {
    id: 9,
    name: "Thomas Miller",
    email: "thomas.m@example.com",
    type: "customer",
    membershipLevel: "standard",
    status: "active",
    signupDate: "2023-09-08",
    lastPurchase: "2024-06-15",
    totalSpent: 950,
  },
  {
    id: 10,
    name: "Amanda Garcia",
    email: "amanda.g@example.com",
    type: "affiliate",
    plan: "premium",
    status: "active",
    signupDate: "2023-10-17",
    lastPurchase: "2024-06-20",
    totalSpent: 7200,
  },
  {
    id: 11,
    name: "James Taylor",
    email: "james.t@example.com",
    type: "customer",
    membershipLevel: "basic",
    status: "pending",
    signupDate: "2023-11-05",
    lastPurchase: "2024-04-22",
    totalSpent: 680,
  },
  {
    id: 12,
    name: "Olivia Martinez",
    email: "olivia.m@example.com",
    type: "affiliate",
    plan: "classic",
    status: "active",
    signupDate: "2023-12-12",
    lastPurchase: "2024-06-10",
    totalSpent: 4500,
  },
  {
    id: 13,
    name: "William Anderson",
    email: "william.a@example.com",
    type: "customer",
    membershipLevel: "basic",
    status: "inactive",
    signupDate: "2024-01-20",
    lastPurchase: "2024-03-05",
    totalSpent: 320,
  },
  {
    id: 14,
    name: "Sophia Thomas",
    email: "sophia.t@example.com",
    type: "affiliate",
    plan: "basic",
    status: "active",
    signupDate: "2024-02-14",
    lastPurchase: "2024-06-22",
    totalSpent: 2800,
  },
  {
    id: 15,
    name: "Daniel White",
    email: "daniel.w@example.com",
    type: "customer",
    membershipLevel: "standard",
    status: "active",
    signupDate: "2024-03-08",
    lastPurchase: "2024-05-30",
    totalSpent: 1100,
  },
  {
    id: 16,
    name: "Emma Clark",
    email: "emma.c@example.com",
    type: "customer",
    membershipLevel: "premium",
    status: "active",
    signupDate: "2024-04-15",
    lastPurchase: "2024-06-18",
    totalSpent: 1850,
  },
  {
    id: 17,
    name: "Ryan Adams",
    email: "ryan.a@example.com",
    type: "affiliate",
    plan: "classic",
    status: "active",
    signupDate: "2024-05-22",
    lastPurchase: "2024-06-25",
    totalSpent: 3600,
  },
  {
    id: 18,
    name: "Jessica Lee",
    email: "jessica.l@example.com",
    type: "customer",
    membershipLevel: "basic",
    status: "inactive",
    signupDate: "2024-06-10",
    lastPurchase: "2024-06-15",
    totalSpent: 420,
  },
  {
    id: 19,
    name: "Christopher Wilson",
    email: "chris.w@example.com",
    type: "affiliate",
    plan: "premium",
    status: "active",
    signupDate: "2024-06-18",
    lastPurchase: "2024-06-28",
    totalSpent: 5100,
  },
  {
    id: 20,
    name: "Natalie Brown",
    email: "natalie.b@example.com",
    type: "customer",
    membershipLevel: "standard",
    status: "active",
    signupDate: "2024-06-22",
    lastPurchase: "2024-06-29",
    totalSpent: 750,
  },
  {
    id: 21,
    name: "Alex Johnson",
    email: "alex.j@example.com",
    type: "customer",
    membershipLevel: "basic",
    status: "pending",
    signupDate: "2024-01-05",
    lastPurchase: "2024-06-10",
    totalSpent: 320,
  },
  {
    id: 22,
    name: "Sophie Martin",
    email: "sophie.m@example.com",
    type: "affiliate",
    plan: "basic",
    status: "active",
    signupDate: "2024-02-18",
    lastPurchase: "2024-06-22",
    totalSpent: 2800,
  },
  {
    id: 23,
    name: "Ethan Davis",
    email: "ethan.d@example.com",
    type: "customer",
    membershipLevel: "premium",
    status: "active",
    signupDate: "2024-03-15",
    lastPurchase: "2024-06-25",
    totalSpent: 1950,
  },
  {
    id: 24,
    name: "Isabella Garcia",
    email: "isabella.g@example.com",
    type: "affiliate",
    plan: "classic",
    status: "active",
    signupDate: "2024-04-20",
    lastPurchase: "2024-06-28",
    totalSpent: 4200,
  },
  {
    id: 25,
    name: "Jacob Wilson",
    email: "jacob.w@example.com",
    type: "customer",
    membershipLevel: "standard",
    status: "inactive",
    signupDate: "2024-05-10",
    lastPurchase: "2024-06-15",
    totalSpent: 680,
  },
]


const CustomerTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeTab, setActiveTab] = useState('all');

  // Format date consistently
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency in Naira
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Filter data based on active tab
  const filteredData = customerData.filter(customer => {
    if (activeTab === 'all') return true;
    if (activeTab === 'customers') return customer.type === 'customer';
    if (activeTab === 'affiliates') return customer.type === 'affiliate';
    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
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

  // Type badge component
  const TypeBadge = ({ type }) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  // Pagination with ellipsis
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxVisibleBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxVisibleAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxVisibleBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxVisibleAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxVisibleBeforeCurrent;
        endPage = currentPage + maxVisibleAfterCurrent;
      }
    }

    if (startPage > 1) {
      items.push(1);
      if (startPage > 2) {
        items.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push('...');
      }
      items.push(totalPages);
    }

    return items;
  };

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Tabs for customer types */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Customers
            </button>
            <button
              onClick={() => {
                setActiveTab('customers');
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => {
                setActiveTab('affiliates');
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'affiliates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Affiliates
            </button>
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('email')}
                >
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan/Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('signupDate')}
                >
                  Signup Date {sortConfig.key === 'signupDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('lastPurchase')}
                >
                  Last Purchase {sortConfig.key === 'lastPurchase' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('totalSpent')}
                >
                  Total Spent {sortConfig.key === 'totalSpent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={customer.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {customer.type === 'affiliate' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {customer.plan}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customer.membershipLevel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(customer.signupDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(customer.lastPurchase)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination with Ellipsis */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>{' '}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeftFromLine />
                </button>
                
                {getPaginationItems().map((item, index) => (
                  item === '...' ? (
                    <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => paginate(item)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === item
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowRightToLine />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;