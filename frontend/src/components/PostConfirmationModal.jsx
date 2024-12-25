import React, { useState } from 'react';
import './PostConfirmationModal.css';

const PostConfirmationModal = ({ isOpen, onClose, onConfirm, postDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Confirm Post</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p><strong>Title:</strong> {postDetails.title}</p>
          <p><strong>Category:</strong> {postDetails.category}</p>
          <p><strong>Content Preview:</strong></p>
          <div className="content-preview">
            {postDetails.content.length > 100 
              ? `${postDetails.content.substring(0, 100)}...` 
              : postDetails.content}
          </div>
          {postDetails.imageUrl && (
            <div className="image-preview">
              <p><strong>Image:</strong></p>
              <img 
                src={postDetails.imageUrl} 
                alt="Preview" 
                className="preview-image"
              />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-confirm" 
            onClick={onConfirm}
          >
            Confirm Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostConfirmationModal;