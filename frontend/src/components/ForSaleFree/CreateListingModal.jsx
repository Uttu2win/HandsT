import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateListingModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'paid',
    image: null,
    imageUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    
    if (formData.image) {
      submitData.append('image', formData.image);
    } else if (formData.imageUrl) {
      submitData.append('imageUrl', formData.imageUrl);
    }

    onSubmit(submitData);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'paid',
      image: null,
      imageUrl: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Listing</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="listing-form" encType="multipart/form-data">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setFormData({
                  ...formData, 
                  category: newCategory,
                  price: newCategory === 'free' ? '0' : formData.price
                });
              }}
              required
            >
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </div>

          {formData.category === 'paid' && (
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Image</label>
            <div className="image-upload-group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      image: file,
                      imageUrl: '' // Clear URL if file is selected
                    });
                  }
                }}
              />
              <div className="separator">OR</div>
              <input
                type="url"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    imageUrl: e.target.value,
                    image: null // Clear file if URL is entered
                  });
                }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingModal;