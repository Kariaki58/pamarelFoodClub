"use client";
import { useState, useEffect, useRef } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

// Generate dummy categories with placeholder images
const generateDummyCategories = () => {
  return [
    {
      _id: '1',
      name: 'Men Collection',
      description: 'Stylish clothing for men',
      image: 'https://picsum.photos/200/200?random=1',
      productCount: 12
    },
    {
      _id: '2',
      name: 'Women Collection',
      description: 'Elegant fashion for women',
      image: 'https://picsum.photos/200/200?random=2',
      productCount: 18
    },
    {
      _id: '3',
      name: 'Kids Collection',
      description: 'Cute outfits for children',
      image: 'https://picsum.photos/200/200?random=3',
      productCount: 8
    },
    {
      _id: '4',
      name: 'Accessories',
      description: 'Fashion accessories for all',
      image: 'https://picsum.photos/200/200?random=4',
      productCount: 25
    },
    {
      _id: '5',
      name: 'Footwear',
      description: 'Comfortable shoes for everyone',
      image: 'https://picsum.photos/200/200?random=5',
      productCount: 15
    },
    {
      _id: '6',
      name: 'Sportswear',
      description: 'Performance athletic wear',
      image: 'https://picsum.photos/200/200?random=6',
      productCount: 10
    },
    {
      _id: '7',
      name: 'Formal Wear',
      description: 'Elegant attire for special occasions',
      image: 'https://picsum.photos/200/200?random=7',
      productCount: 7
    }
  ];
};

export default function CategoryDisplay() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [categoryToUpdateImage, setCategoryToUpdateImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Load dummy categories
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCategories(generateDummyCategories());
      setLoading(false);
    }, 500);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setFormData({
      name: category.name,
      description: category.description
    });
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  // Handle save changes
  const handleSave = (id) => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setCategories(categories.map(cat => 
        cat._id === id ? { ...cat, ...formData } : cat
      ));
      setEditingCategory(null);
      setLoading(false);
      toast.success('Category updated successfully');
    }, 500);
  };

  // Handle image click to change image
  const handleImageClick = (category) => {
    setCategoryToUpdateImage(category);
    setShowImageUploadModal(true);
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageUrl = reader.result;
        setCategories(categories.map(cat => 
          cat._id === categoryToUpdateImage._id 
            ? { ...cat, image: newImageUrl } 
            : cat
        ));
        toast.success('Category image updated');
      };
      reader.readAsDataURL(file);
    }
    setShowImageUploadModal(false);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle delete confirmation
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setLoading(false);
      toast.success('Category deleted successfully');
    }, 500);
  };

  // Pagination logic
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="relative h-10 w-10 rounded-full overflow-hidden cursor-pointer group"
                          onClick={() => handleImageClick(category)}
                        >
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiImage className="text-white" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCategory === category._id ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingCategory === category._id ? (
                          <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            maxLength={50}
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{category.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.productCount} products
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingCategory === category._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleSave(category._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-4">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(category)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {categories.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiChevronLeft className="mr-1" /> Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Next <FiChevronRight className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <div className="flex items-center mb-4">
              <img 
                src={categoryToDelete?.image} 
                alt={categoryToDelete?.name} 
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-medium">{categoryToDelete?.name}</p>
                <p className="text-sm text-gray-500">{categoryToDelete?.description}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? 
              This will also remove all {categoryToDelete?.productCount || 0} products associated with it.
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

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Image for {categoryToUpdateImage?.name}
            </h3>
            <div className="flex justify-center mb-6">
              <img 
                src={categoryToUpdateImage?.image} 
                alt={categoryToUpdateImage?.name} 
                className="h-32 w-32 rounded-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImageUploadModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={triggerFileInput}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Select New Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}