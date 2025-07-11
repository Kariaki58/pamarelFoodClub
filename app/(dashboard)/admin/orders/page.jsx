"use client";
import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  User,
  Users,
  Repeat2
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Generate MLM-focused order data
const generateOrders = () => {
  const statuses = [
    { name: 'pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'processing', icon: Clock, color: 'bg-blue-100 text-blue-800' },
    { name: 'delivered', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
    { name: 'cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
    { name: 'return', icon: Repeat2, color: 'bg-orange-100 text-orange-800' }
  ];
  
  const products = [
    { name: 'Starter Kit', category: 'MLM Package', price: 15000 },
    { name: 'Premium Bundle', category: 'MLM Package', price: 35000 },
    { name: 'Business Pack', category: 'MLM Package', price: 75000 },
    { name: 'Organic Coconut Oil', category: 'Product', price: 5000 },
    { name: 'Herbal Tea Set', category: 'Product', price: 8000 },
    { name: 'Vitamin C Serum', category: 'Product', price: 12000 }
  ];
  
  // MLM members with their level in the network
  const mlmMembers = [
    { id: 'MLM001', name: 'John Smith', email: 'john.smith@example.com', level: 3, joinDate: '2023-01-15', isMlm: true },
    { id: 'MLM002', name: 'Sarah Johnson', email: 'sarah.j@example.com', level: 5, joinDate: '2023-02-10', isMlm: true },
    { id: 'MLM003', name: 'Michael Brown', email: 'michael.b@example.com', level: 2, joinDate: '2023-03-22', isMlm: true },
    { id: 'MLM004', name: 'Emily Davis', email: 'emily.d@example.com', level: 4, joinDate: '2023-04-05', isMlm: true }
  ];
  
  // Regular customers
  const regularCustomers = [
    { id: 'CUST001', name: 'Alex Wilson', email: 'alex.w@example.com', isMlm: false },
    { id: 'CUST002', name: 'Jessica Taylor', email: 'jessica.t@example.com', isMlm: false },
    { id: 'CUST003', name: 'David Miller', email: 'david.m@example.com', isMlm: false }
  ];
  
  const allCustomers = [...mlmMembers, ...regularCustomers];
  
  const orders = [];
  
  for (let i = 1; i <= 125; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomCustomer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const date = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    
    // Calculate commission for MLM members (10% of product price)
    const commission = randomCustomer.isMlm ? Math.floor(randomProduct.price * quantity * 0.1) : 0;
    
    orders.push({
      id: `ORD${10000 + i}`,
      date: date.toISOString(),
      customer: randomCustomer,
      product: randomProduct,
      quantity,
      amount: randomProduct.price,
      total: randomProduct.price * quantity,
      status: randomStatus,
      payment: Math.random() > 0.3 ? 'Paid' : 'Pending', // 70% paid
      shipping: 'Standard',
      commission,
      isMlmOrder: randomCustomer.isMlm
    });
  }
  
  return orders;
};

const OrderStatusBadge = ({ status }) => {
  const StatusIcon = status.icon;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
      <StatusIcon className="mr-1 h-3 w-3" />
      {status.name}
    </span>
  );
};

const CustomerTypeBadge = ({ isMlm }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isMlm ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isMlm ? (
        <>
          <Users className="mr-1 h-3 w-3" />
          MLM Member
        </>
      ) : (
        <>
          <User className="mr-1 h-3 w-3" />
          Customer
        </>
      )}
    </span>
  );
};

const LevelIndicator = ({ level }) => {
  if (!level) return null;
  return (
    <div className="flex items-center mt-1 text-xs text-gray-500">
      <span className="mr-1">Level:</span>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full mx-0.5 ${i < level ? 'bg-purple-600' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: order.status.name,
    notes: ''
  });

  const statusOptions = [
    { name: 'pending', label: 'Pending', icon: Clock },
    { name: 'processing', label: 'Processing', icon: Clock },
    { name: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    { name: 'cancelled', label: 'Cancelled', icon: XCircle }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedStatus = statusOptions.find(s => s.name === formData.status);
    onUpdate(order.id, {
      ...order,
      status: {
        name: updatedStatus.name,
        icon: updatedStatus.icon,
        color: order.status.color // Keep the same color or update based on new status
      }
    });
    setEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Order #{order.id}</h2>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900">Customer Information</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.customer.name}</p>
                  <CustomerTypeBadge isMlm={order.customer.isMlm} />
                </div>
                <p className="text-gray-500">{order.customer.email}</p>
                {order.customer.isMlm && (
                  <>
                    <p className="text-gray-500">Member ID: {order.customer.id}</p>
                    <LevelIndicator level={order.customer.level} />
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Shipping Information</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>123 Main Street</p>
                <p className="text-gray-500">Lagos, Nigeria</p>
                <p className="text-gray-500">{order.shipping} Shipping</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900">Order Items</h3>
            <div className="mt-4 border rounded-lg divide-y">
              <div className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">{order.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {order.product.category} • Qty: {order.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(order.amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900">Order Status</h3>
            <div className="mt-2">
              {editing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  {statusOptions.map(option => (
                    <option key={option.name} value={option.name}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <OrderStatusBadge status={order.status} />
              )}
            </div>
          </div>

          {order.isMlmOrder && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900">MLM Commission</h3>
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Earned Commission</p>
                    <p className="text-xs text-purple-600">10% of product value</p>
                  </div>
                  <p className="text-lg font-bold text-purple-800">
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(order.commission)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium text-gray-900">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(order.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>₦1,500.00</span>
              </div>
              {order.isMlmOrder && (
                <div className="flex justify-between">
                  <span className="text-gray-500">MLM Commission</span>
                  <span className="text-purple-600">
                    -{new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(order.commission)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2 mt-1">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(order.total + 1500 - (order.isMlmOrder ? order.commission : 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 flex items-center gap-2 border rounded-md text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Update Status
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pages.push(1);
    
    // Show ellipsis if current page is far from start
    if (currentPage > maxVisiblePages - 1) {
      pages.push('...');
    }
    
    // Calculate start and end pages
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the start or end
    if (currentPage <= maxVisiblePages - 1) {
      endPage = maxVisiblePages;
    } else if (currentPage >= totalPages - (maxVisiblePages - 2)) {
      startPage = totalPages - (maxVisiblePages - 1);
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - (maxVisiblePages - 2)) {
      pages.push('...');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
            <span className="font-medium">{totalPages * 10}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                >
                  <Ellipsis className="h-5 w-5" />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-blue-600 text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState(generateOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  useEffect(() => {
    // Reset to first page when status filter changes
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status.name === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentItems = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrder = (orderId, updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? updatedOrder : order
      )
    );
    setIsModalOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get badge counts for each status
  const getStatusCount = (status) => {
    return orders.filter(order => order.status.name === status).length;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">MLM Orders Management</h1>
          <p className="text-gray-500">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders` : 'All Orders'}
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 w-full border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <a
            href="/admin/orders"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              !statusFilter
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Orders
          </a>
          <a
            href="/admin/orders?status=pending"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'pending'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending {getStatusCount('pending') > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {getStatusCount('pending')}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=processing"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'processing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Processing {getStatusCount('processing') > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getStatusCount('processing')}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=delivered"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'delivered'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivered
          </a>
          <a
            href="/admin/orders?status=cancelled"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'cancelled'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled {getStatusCount('cancelled') > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {getStatusCount('cancelled')}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=return"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'return'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Return {getStatusCount('return') > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {getStatusCount('return')}
              </span>
            )}
          </a>

        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    Order ID
                    {sortConfig.key === 'id' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('customer.name')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig.key === 'customer.name' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    {sortConfig.key === 'total' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CustomerTypeBadge isMlm={order.customer.isMlm} />
                      {order.customer.isMlm && (
                        <div className="text-xs text-gray-500 mt-1">
                          Level {order.customer.level}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.product.name}</div>
                      <div className="text-xs text-gray-500">
                        {order.product.category} • Qty: {order.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: 'NGN'
                        }).format(order.total)}
                      </div>
                      {order.isMlmOrder && (
                        <div className="text-xs text-purple-600">
                          +{new Intl.NumberFormat('en-NG', {
                            style: 'currency',
                            currency: 'NGN'
                          }).format(order.commission)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateOrder}
        />
      )}
    </div>
  );
}