"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

// Dynamically import components with SSR disabled
const Quill = typeof window === 'object' ? require('quill') : () => false;
const CreatableSelect = dynamic(
  () => import('react-select/creatable').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <div className="h-10 bg-gray-100 rounded-md"></div>
  }
);

const ProductUploadDashboard = () => {
  // State management
  const [productName, setProductName] = useState('');
  const [variants, setVariants] = useState([
    { id: Date.now(), color: '', size: '', stock: '', price: '' }
  ]);
  const [category, setCategory] = useState({
    name: '',
    image: null,
    imagePreview: '',
    description: ''
  });
  const [description, setDescription] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specifications, setSpecifications] = useState([]);

  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  // Initialize Quill editor
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

    if (typeof window !== 'undefined') {
      loadQuill();
    }
  }, []);

  // Handle form submission
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
      toast.error("Category name is required");
      setLoading(false);
      return;
    } else if (!category.image) {
      toast.error("Category image is required");
      setLoading(false);
      return;
    } else if (category.description.length > 50) {
      toast.error("Category description must be 50 characters or less");
      setLoading(false);
      return;
    } else if (productImages.length < 1) {
      toast.error("Product images are required");
      setLoading(false);
      return;
    } else if (variants.some(v => !v.color || !v.size || !v.stock || !v.price)) {
      toast.error("All variant fields are required");
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: productName,
        variants,
        category: {
          name: category.name,
          description: category.description,
          image: category.image
        },
        description,
        images: productImages,
        specifications
      };
      
      console.log('Product submitted:', productData);
      toast.success("Product uploaded successfully!");
      
      // Reset form
      setProductName('');
      setVariants([{ id: Date.now(), color: '', size: '', stock: '', price: '' }]);
      setCategory({
        name: '',
        image: null,
        imagePreview: '',
        description: ''
      });
      setDescription('');
      setProductImages([]);
      setImagePreviews([]);
      setSpecifications([]);
      
      if (quillInstance.current) {
        quillInstance.current.root.innerHTML = '';
      }
    } catch (error) {
      toast.error("Error uploading product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product image upload
  const onDrop = (acceptedFiles) => {
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

  // Variant management
  const addVariant = () => {
    setVariants([...variants, { id: Date.now(), color: '', size: '', stock: '', price: '' }]);
  };

  const removeVariant = (id) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    } else {
      toast.error("At least one variant is required");
    }
  };

  const updateVariant = (id, field, value) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div>
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
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Category Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
              <input
                type="text"
                value={category.name}
                onChange={(e) => setCategory({...category, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
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
                required
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
        </div>

        {/* Variants Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Product Variants</h3>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              <FaPlus className="mr-1" /> Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={variant.id} className="mb-4 p-3 border border-gray-200 rounded-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Variant {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaMinus />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color*</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g. Red"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Size*</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g. M"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock*</label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (₦)*</label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
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