"use client";

import { useState, useEffect, useRef } from "react";
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
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
      description: category.description
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSave = (id) => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setCategories(prev =>
      prev.map(cat => (cat._id === id ? { ...cat, ...formData } : cat))
    );
    setEditingCategory(null);
    toast.success("Category updated");
  };

  const handleImageClick = (category) => {
    setCategoryToUpdateImage(category);
    setShowImageUploadModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.match("image.*")) {
      toast.error("Only image files allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategories(prev =>
        prev.map(cat =>
          cat._id === categoryToUpdateImage._id
            ? { ...cat, image: reader.result }
            : cat
        )
      );
      toast.success("Image updated");
      setShowImageUploadModal(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setCategories(prev => prev.filter(cat => cat._id !== categoryToDelete._id));
    setShowDeleteModal(false);
    toast.success("Category deleted");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Image</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Products</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map(cat => (
                  <tr key={cat._id}>
                    <td className="px-6 py-3">
                      <div
                        className="h-10 w-10 rounded-full overflow-hidden cursor-pointer relative group"
                        onClick={() => handleImageClick(cat)}
                      >
                        <img src={cat.image.url} alt={cat.name} className="object-cover h-full w-full" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 hidden group-hover:flex items-center justify-center">
                          <FiImage className="text-white" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {editingCategory === cat._id ? (
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {editingCategory === cat._id ? (
                        <input
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        <span className="text-gray-600">{cat.description}</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{cat.productCount}</td>
                    <td className="px-6 py-3 text-right">
                      {editingCategory === cat._id ? (
                        <>
                          <button onClick={() => handleSave(cat._id)} className="text-green-600 mr-2">Save</button>
                          <button onClick={cancelEdit} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(cat)} className="text-blue-600 mr-4"><FiEdit /></button>
                          <button onClick={() => confirmDelete(cat)} className="text-red-600"><FiTrash2 /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 text-gray-700 hover:underline disabled:text-gray-400"
            >
              <FiChevronLeft /> Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-gray-700 hover:underline disabled:text-gray-400"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </>
      )}

      {/* Image upload modal */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4">Update Image</h3>
            <img src={categoryToUpdateImage?.image} alt="" className="h-32 w-32 mx-auto rounded-full object-cover mb-4" />
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowImageUploadModal(false)} className="text-gray-600">Cancel</button>
              <button onClick={triggerFileInput} className="bg-blue-600 text-white px-4 py-2 rounded-md">Select Image</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete <strong>{categoryToDelete?.name}</strong> and its products?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-600">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
