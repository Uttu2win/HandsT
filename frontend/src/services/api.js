import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add User
export const registerUser = (userData) => API.post('/users/register', userData);

export const loginUser = async (loginData) => {
  try {
    const response = await API.post(
      loginData.isAdmin ? '/users/login/admin' : '/users/login', 
      loginData
    );
    
    // Store the token in localStorage
    localStorage.setItem('token', response.data.token);
    
    // Store the user information in localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const fetchNeighborhoods = () => API.get('/neighborhoods');

export const fetchUsers = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/users?${queryString}`);
};

export const deleteUser = (userId) => API.delete(`/users/${userId}`);

export const createNeighborhood = (neighborhoodData) => 
  API.post('/neighborhoods', neighborhoodData);

export const updateNeighborhood = (neighborhoodId, neighborhoodData) => 
  API.put(`/neighborhoods/${neighborhoodId}`, neighborhoodData);

export const deleteNeighborhood = (neighborhoodId) => 
  API.delete(`/neighborhoods/${neighborhoodId}`);

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const createPost = (postData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.neighborhoodId) {
    return Promise.reject(new Error('No neighborhood ID found'));
  }
  
  // If postData is already FormData, just append neighborhoodId
  if (postData instanceof FormData) {
    postData.append('neighborhoodId', user.neighborhoodId);
  } else {
    // Create new FormData if regular object
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      formData.append(key, postData[key]);
    });
    postData = formData;
  }
  
  return API.post('/posts', postData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const fetchPosts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.neighborhoodId) {
      console.warn('No neighborhood ID found');
      return { data: [] };
    }
    
    return await API.get(`/posts?neighborhoodId=${user.neighborhoodId}`, getAuthHeader());
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await API.post(
      `/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response;
  } catch (error) {
    console.error('API Like Post Error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchListings = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/listings?${queryString}`, getAuthHeader());
};

export const createListing = (listingData) => {
  if (listingData instanceof FormData) {
    return API.post('/listings', listingData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return API.post('/listings', listingData, getAuthHeader());
};

export const deleteListing = (listingId) => {
  return API.delete(`/listings/${listingId}`, getAuthHeader());
};

export const addComment = async (postId, text) => {
  try {
    const response = await API.post(`/posts/${postId}/comment`, { text });
    return response;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const fetchNotifications = async () => {
  try {
    const response = await API.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await API.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getPostImageUrl = async (post) => {
  if (!post) return null;
  
  // If it's an external URL, try to proxy it through our backend
  if (post.imageUrl) {
    try {
      const response = await fetch(post.imageUrl);
      if (response.ok) {
        return post.imageUrl;
      }
    } catch (error) {
      console.warn('External image failed to load:', error);
    }
    // If external URL fails, return null to trigger fallback
    return null;
  }
  
  // If it's a buffer image, return the backend URL with auth token
  if (post._id) {
    return `/posts/${post._id}/image`;
  }
  
  return null;
};