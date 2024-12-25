// Image utility functions
export const getImageFallback = (type = 'default') => {
    const fallbacks = {
      default: 'https://via.placeholder.com/300x200?text=No+Image',
      error: 'https://via.placeholder.com/300x200?text=Image+Not+Found',
      profile: 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png'
    };
    return fallbacks[type] || fallbacks.default;
  };
  
  export const getListingImageUrl = (listing) => {
    if (!listing) return getImageFallback();
    
    const { imageUrl, hasImage, _id } = listing;
    
    if (imageUrl) return imageUrl;
    if (hasImage) return `http://localhost:8000/api/listings/${_id}/image`;
    return getImageFallback();
  };
  
  export const getProfileImageUrl = (userId) => {
    if (!userId) return getImageFallback('profile');
    return `http://localhost:8000/api/users/profile/picture/${userId}`;
  };