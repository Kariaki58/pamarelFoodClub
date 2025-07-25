"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { FaTrash, FaPlus, FaMinus, FaEdit, FaTimes } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

const Quill = typeof window === 'object' ? require('quill') : () => false;
const CreatableSelect = dynamic(
  () => import('react-select/creatable').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <div className="h-10 bg-gray-100 rounded-md"></div>
  }
);

async function uploadImages(images) {
  const formData = new FormData();
  images.forEach(file => formData.append("images", file));

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Upload failed:", data.error || "Unknown error");
    throw new Error(data.error || "Upload failed");
  }

  return data.urls || [];
}

const ProductUploadDashboard = () => {
  // State management
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [percentOff, setPercentOff] = useState(0);
  const [section, setSection] = useState('food');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isTopDeal, setIsTopDeal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [flashSale, setFlashSale] = useState({
    active: false,
    start: '',
    end: '',
    discountPercent: 0
  });
  const [category, setCategory] = useState({
    name: '',
    image: null,
    imagePreview: '',
    description: '',
    isNew: true
  });
  const [databaseCategories, setDatabaseCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specifications, setSpecifications] = useState([]);

  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  // Initialize Quill editor and fetch categories
  useEffect(() => {
    const loadQuill = async () => {
      const Quill = (await import('quill')).default;

      if (editorRef.current && !quillInstance.current) {
        quillInstance.current = new Quill(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['image', 'video', 'blockquote', 'code-block'],
              ['clean'],
            ],
          },
        });

        quillInstance.current.on('text-change', () => {
          const currentContent = quillInstance.current.root.innerHTML;
          setDescription(currentContent);
        });
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category", {
          method: "GET"
        });
        const data = await response.json();
        
        if (response.ok) {
          const formattedCategories = data.message.map(cat => ({
            value: cat._id,
            label: cat.name,
            description: cat.description,
            image: cat.image
          }));
          setDatabaseCategories(formattedCategories);
        } else {
          throw new Error(data.message || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();

    if (typeof window !== 'undefined') {
      loadQuill();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!productName) {
      toast.error("Product Name is required");
      setLoading(false);
      return;
    } else if (!description) {
      toast.error("Description is required");
      setLoading(false);
      return;
    } else if (!category.name) {
      toast.error("Category is required");
      setLoading(false);
      return;
    } else if (category.isNew && !category.image) {
      toast.error("Category image is required for new categories");
      setLoading(false);
      return;
    } else if (category.isNew && category.description.length > 50) {
      toast.error("Category description must be 50 characters or less");
      setLoading(false);
      return;
    } else if (productImages.length < 1) {
      toast.error("Product images are required");
      setLoading(false);
      return;
    } else if (price < 0) {
      toast.error("Price must be a positive number");
      setLoading(false);
      return;
    } else if (stock < 0) {
      toast.error("Stock must be a positive number");
      setLoading(false);
      return;
    } else if (flashSale.active && (!flashSale.start || !flashSale.end)) {
      toast.error("Flash sale requires both start and end dates");
      setLoading(false);
      return;
    }

    try {
      // Upload product images
      const productImageUrls = await uploadImages(productImages);
      
      // For new categories, upload category image
      let categoryImageUrl = '';
      if (category.isNew) {
        const categoryImageUrls = await uploadImages([category.image]);
        categoryImageUrl = categoryImageUrls[0];
      } else {
        // Find the selected category to get its existing image
        const selectedCategory = databaseCategories.find(cat => cat.label === category.name);
        if (selectedCategory) {
          categoryImageUrl = selectedCategory.image;
        }
      }

      const payload = {
        product: {
          name: productName,
          description: description,
          images: productImageUrls,
          specifications: specifications.filter(spec => spec.key && spec.value),
          price: parseFloat(price),
          stock: parseInt(stock),
          percentOff: parseFloat(percentOff),
          section: section,
          tags: tags,
          isTopDeal: isTopDeal,
          isFeatured: isFeatured,
          flashSale: flashSale.active ? {
            start: new Date(flashSale.start),
            end: new Date(flashSale.end),
            discountPercent: parseFloat(flashSale.discountPercent)
          } : null
        },
        category: {
          name: category.name,
          description: category.description,
          image: categoryImageUrl,
          isNew: category.isNew
        }
      };

      const response = await fetch('/api/product/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload product');
      }

      toast.success("Product uploaded successfully!");
      
      // Reset form after successful submission
      setProductName('');
      setPrice(0);
      setStock(0);
      setPercentOff(0);
      setSection('food');
      setTags([]);
      setIsTopDeal(false);
      setIsFeatured(false);
      setFlashSale({
        active: false,
        start: '',
        end: '',
        discountPercent: 0
      });
      setCategory({
        name: '',
        image: null,
        imagePreview: '',
        description: '',
        isNew: true
      });
      setDescription('');
      setProductImages([]);
      setImagePreviews([]);
      setSpecifications([]);
      if (quillInstance.current) {
        quillInstance.current.root.innerHTML = '';
      }
    } catch (error) {
      toast.error(error.message || "Error uploading product");
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product image upload
  const onDrop = (acceptedFiles) => {
    if (productImages.length + acceptedFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setProductImages([...productImages, ...acceptedFiles]);
  };

  // Handle category image upload
  const onCategoryImageDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setCategory({
        ...category,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  const { getRootProps: getCategoryImageRootProps, getInputProps: getCategoryImageInputProps } = useDropzone({
    onDrop: onCategoryImageDrop,
    accept: 'image/*',
    multiple: false
  });

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
    
    const updatedImages = [...productImages];
    updatedImages.splice(index, 1);
    setProductImages(updatedImages);
  };

  const removeCategoryImage = () => {
    setCategory({
      ...category,
      image: null,
      imagePreview: ''
    });
  };

  // Handle category selection change
  const handleCategoryChange = (selectedOption, actionMeta) => {
    if (actionMeta.action === 'create-option') {
      // Creating a new category
      setCategory({
        name: selectedOption.label,
        image: null,
        imagePreview: '',
        description: '',
        isNew: true
      });
    } else if (actionMeta.action === 'select-option') {
      // Selecting an existing category
      const selectedCategory = databaseCategories.find(cat => cat.value === selectedOption.value);
      setCategory({
        name: selectedOption.label,
        image: null,
        imagePreview: selectedCategory.image,
        description: selectedCategory.description || '',
        isNew: false
      });
    } else if (actionMeta.action === 'clear') {
      // Clearing the selection
      setCategory({
        name: '',
        image: null,
        imagePreview: '',
        description: '',
        isNew: true
      });
    }
  };

  // Specifications management
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    const updatedSpecs = [...specifications];
    updatedSpecs.splice(index, 1);
    setSpecifications(updatedSpecs);
  };

  const updateSpecification = (index, field, value) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);
  };

  // Tags management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={percentOff}
                onChange={(e) => setPercentOff(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section*</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="food">Food</option>
                <option value="gadget">Gadget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Category Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
            <CreatableSelect
              options={databaseCategories}
              onChange={handleCategoryChange}
              value={category.name ? { label: category.name, value: category.name } : null}
              isClearable
              placeholder="Select or create a category..."
              className="react-select-container"
              classNamePrefix="react-select"
              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            />
          </div>

          {category.isNew && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Description (max 50 chars)*
                    <span className="text-xs text-gray-500 ml-1">
                      {category.description.length}/50
                    </span>
                  </label>
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setCategory({...category, description: e.target.value})
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={50}
                    required={category.isNew}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image*</label>
                {category.imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img 
                      src={category.imagePreview} 
                      alt="Category preview" 
                      className="w-full h-full object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeCategoryImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div 
                    {...getCategoryImageRootProps()} 
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
                  >
                    <input {...getCategoryImageInputProps()} />
                    <p className="text-gray-600">Click to upload category image</p>
                    <p className="text-sm text-gray-500 mt-1">Single image required</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Product Images Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Images*</h3>
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">Drag 'n' drop images here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-1">Minimum 1 image required (Max 10 images)</p>
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={src} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Description*</h3>
          <div 
            ref={editorRef} 
            className="h-64 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500"
          />
        </div>

        {/* Tags Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Tags</h3>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-gray-600 hover:text-red-500"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tags added yet</p>
          )}
        </div>

        {/* Promotional Options Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Promotional Options</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTopDeal"
                checked={isTopDeal}
                onChange={(e) => setIsTopDeal(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isTopDeal" className="ml-2 block text-sm text-gray-700">
                Mark as Top Deal
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Mark as Featured Product
              </label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="flashSale"
                  checked={flashSale.active}
                  onChange={(e) => setFlashSale({...flashSale, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="flashSale" className="ml-2 block text-sm text-gray-700">
                  Enable Flash Sale
                </label>
              </div>
              
              {flashSale.active && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                    <input
                      type="datetime-local"
                      value={flashSale.start}
                      onChange={(e) => setFlashSale({...flashSale, start: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={flashSale.active}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                    <input
                      type="datetime-local"
                      value={flashSale.end}
                      onChange={(e) => setFlashSale({...flashSale, end: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={flashSale.active}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %*</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={flashSale.discountPercent}
                      onChange={(e) => setFlashSale({...flashSale, discountPercent: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={flashSale.active}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Specifications</h3>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              <FaPlus className="mr-1" /> Add Specification
            </button>
          </div>

          {specifications.length > 0 ? (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Key</label>
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g. Material"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g. Cotton"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="w-full py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No specifications added yet</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Product'}
          </button>
        </div>
      </form>
      <Toaster position="top-center" />
    </div>
  );
};

export default ProductUploadDashboard;