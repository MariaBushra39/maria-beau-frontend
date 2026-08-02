import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaUpload, FaTimes, FaImage } from 'react-icons/fa';
import API_URL from '../api';
import './Admin.css';

// If the image is already a full URL (e.g. Cloudinary), use it as-is.
// Otherwise, treat it as a filename served from our own backend.
const getImageSrc = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `${API_URL}/uploads/${filename}`;
};

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Women',
    subcategory: '',
    sizes: '',
    colors: '',
    images: '',
    stock: '',
    is_featured: false
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          const p = data.data;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            price: p.price || '',
            category: p.category || 'Women',
            subcategory: p.subcategory || '',
            sizes: (p.sizes || []).join(', '),
            colors: (p.colors || []).join(', '),
            images: (p.images || []).join(', '),
            stock: p.stock || '',
            is_featured: p.is_featured || false
          });
        } else {
          toast.error('Product not found');
          navigate('/admin');
        }
      } catch (error) {
        toast.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ============================================================
  // 🖼️ IMAGE UPLOAD FUNCTION (Edit mein bhi - uploads to Cloudinary)
  // ============================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/products/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await res.json();
      if (data.success) {
        const filename = data.data.filename;
        setFormData(prev => ({
          ...prev,
          images: prev.images ? `${prev.images}, ${filename}` : filename
        }));
        toast.success('Image uploaded!');
      } else {
        toast.error(data.message || 'Image upload failed');
      }
    } catch (error) {
      toast.error('Server error during upload');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Remove a single image from the comma-separated list by index
  const removeImage = (indexToRemove) => {
    const imageList = formData.images.split(',').map(s => s.trim()).filter(Boolean);
    const updated = imageList.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({ ...prev, images: updated.join(', ') }));
  };

  const imageList = formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [];
    const colorsArray = formData.colors ? formData.colors.split(',').map(c => c.trim()) : [];
    const imagesArray = formData.images ? formData.images.split(',').map(i => i.trim()) : ['dummy.jpg'];

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      subcategory: formData.subcategory || null,
      sizes: sizesArray,
      colors: colorsArray,
      images: imagesArray,
      stock: parseInt(formData.stock) || 0,
      is_featured: formData.is_featured
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Product updated successfully!');
        navigate('/admin');
      } else {
        toast.error(data.message || 'Failed to update product');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">⏳ LOADING ...</div>;

  return (
    <div className="admin-form-page">
      <div className="admin-form-header">
        <h1>Edit Product</h1>
        <Link to="/admin" className="back-link"><FaArrowLeft /> Back to Admin</Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price (Rs.) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div className="form-group">
            <label>Subcategory</label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sizes (comma separated)</label>
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Colors (comma separated)</label>
            <input
              type="text"
              name="colors"
              value={formData.colors}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 🖼️ IMAGE UPLOAD SECTION (Edit mein bhi) */}
        {/* ============================================================ */}
        <div className="form-group image-upload-group">
          <label>Product Images</label>

          <label className="upload-dropzone">
            <FaUpload />
            <span>{uploadingImage ? 'Uploading...' : 'Click to upload an image (JPG/PNG, max 5MB)'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              hidden
            />
          </label>

          {imageList.length > 0 && (
            <div className="image-preview-row">
              {imageList.map((filename, idx) => {
                const previewSrc = filename !== 'dummy.jpg' ? getImageSrc(filename) : null;
                return (
                  <div className="image-preview-item" key={`${filename}-${idx}`}>
                    {previewSrc ? (
                      <img src={previewSrc} alt={`upload-${idx}`} />
                    ) : (
                      <div className="image-preview-placeholder"><FaImage /></div>
                    )}
                    <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>
                      <FaTimes />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <small>Filenames are added automatically after upload. You can also type/edit them manually below.</small>
          <input
            type="text"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="image-123.jpg, image-456.jpg"
            className="images-text-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
              />
              Featured Product
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          <FaSave /> {submitting ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}

export default EditProduct;