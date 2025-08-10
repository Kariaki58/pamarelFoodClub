"use client";

import { useState, useEffect, useRef } from "react";
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiImage, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 5;

export default function CategoryDisplay() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [categoryToUpdateImage, setCategoryToUpdateImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null
  });

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/category/admin?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const json = await res.json();

      if (res.ok) {
        setCategories(json.message);
        setTotalPages(json.pagination.totalPages);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      toast.error("Server error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: null });
  };

  const handleSave = async (id) => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        ...(formData.image && { image: formData.image })
      };

      const res = await fetch(`/api/category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(prev =>
          prev.map(cat => (cat._id === id ? { ...cat, ...payload } : cat))
        );
        setEditingCategory(null);
        toast.success("Category updated successfully");
      } else {
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    }
  };

  const handleImageClick = (category) => {
    setCategoryToUpdateImage(category);
    setShowImageUploadModal(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file?.type.match("image.*")) {
      toast.error("Only image files allowed");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (uploadRes.ok) {
        const imageUrl = uploadData.urls[0];
        setFormData(prev => ({
          ...prev,
          image: {
            url: imageUrl,
            publicId: uploadData.publicIds?.[0] || ''
          }
        }));
        toast.success("Image uploaded successfully");
        setShowImageUploadModal(false); // Close the modal on success
      } else {
        toast.error(uploadData.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/category/${categoryToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(prev => prev.filter(cat => cat._id !== categoryToDelete._id));
        // If we deleted the last item on the page, go to previous page
        if (categories.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        setShowDeleteModal(false);
        toast.success("Category deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Categories Management</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map(cat => (
                    <tr key={cat._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="h-10 w-10 rounded-full overflow-hidden cursor-pointer relative group"
                            onClick={() => handleImageClick(cat)}
                          >
                            <img 
                              src={cat.image?.url || '/placeholder-image.jpg'} 
                              alt={cat.name} 
                              className="object-cover h-full w-full"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 hidden group-hover:flex items-center justify-center">
                              <FiImage className="text-white" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCategory === cat._id ? (
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingCategory === cat._id ? (
                          <input
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{cat.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {cat.productCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingCategory === cat._id ? (
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleSave(cat._id)} 
                              className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
                            >
                              Save
                            </button>
                            <button 
                              onClick={cancelEdit} 
                              className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-4">
                            <button 
                              onClick={() => handleEdit(cat)} 
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button 
                              onClick={() => confirmDelete(cat)} 
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="mr-1" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <FiChevronRight className="ml-1" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Image upload modal */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold text-gray-800">Update Category Image</h3>
              <button 
                onClick={() => setShowImageUploadModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                  <img 
                    src={categoryToUpdateImage?.image?.url || '/placeholder-image.jpg'} 
                    alt="Category" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">Click below to select a new image</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
                <button
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className={`px-4 py-2 rounded-md text-white ${isUploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors flex items-center`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : 'Select Image'}
                </button>
              </div>
            </div>
            <div className="flex justify-end border-t p-4">
              <button
                onClick={() => setShowImageUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md mr-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-semibold">"{categoryToDelete?.name}"</span>? 
                This action cannot be undone.
              </p>
              {categoryToDelete?.productCount > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Warning: This category contains {categoryToDelete?.productCount} product(s). Deleting it will remove all associated products.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t p-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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