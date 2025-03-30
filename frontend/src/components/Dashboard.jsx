import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, fetchPosts, likePost,addComment, getPostImageUrl } from '../services/api.js';
import PostConfirmationModal from './PostConfirmationModal.jsx';
import ForSaleFree from './ForSaleFree/ForSaleFree.jsx';
import Notifications from './Notifications.jsx';
import ProfileMenu from './Profile Management/ProfileMenu.jsx';
import Map from './Map/Map.jsx';
import axios from 'axios';
import { Send, MessageCircle, Map as MapIcon } from 'lucide-react';
import './Dashboard.css';
import { formatTimeAgo } from '../utils/dateUtils.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [allPosts, setAllPosts] = useState([]); // Store all posts
  const [filteredPosts, setFilteredPosts] = useState([]); // Store filtered posts
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingPost, setPendingPost] = useState(null);
  const [user, setUser] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);


  //Load user from local storage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    
    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
  
        if (parsedUser.neighborhoodId) {
          const fetchNeighborhoodDetails = async () => {
            try {
              const response = await axios.get(
                `http://localhost:8000/api/neighborhoods/${parsedUser.neighborhoodId}`,
                {
                  headers: { 
                    Authorization: `Bearer ${storedToken}` 
                  }
                }
              );
              setNeighborhood(response.data);
            } catch (error) {
              console.error('Error fetching neighborhood:', error);
              // Handle the error gracefully without breaking the UI
              setNeighborhood(null);
            }
          };
  
          fetchNeighborhoodDetails();
        }
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Handle invalid stored data
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      const loadPosts = async () => {
        try {
          setIsLoading(true);
          const response = await fetchPosts();
          const postsData = Array.isArray(response.data) ? response.data : [];
          setPosts(postsData);
          setAllPosts(postsData);
          setFilteredPosts(postsData); // Initialize filtered posts with all posts
          setError(null);
        } catch (error) {
          console.error('Error fetching posts:', error);
          setAllPosts([]);
          setFilteredPosts([]);
          setError('Failed to fetch posts. Please try logging in again.');
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }
        } finally {
          setIsLoading(false);
        }
      };

      loadPosts();
    }
  }, [currentView, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(allPosts);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = allPosts.filter(post => 
        (post.title?.toLowerCase().includes(lowercaseSearch) ||
        post.content?.toLowerCase().includes(lowercaseSearch) ||
        post.category?.toLowerCase().includes(lowercaseSearch) ||
        post.createdBy?.name?.toLowerCase().includes(lowercaseSearch))
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, allPosts]);




const handleCreatePost = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const postData = new FormData();
  
  postData.append('title', formData.get('title'));
  postData.append('content', formData.get('content'));
  postData.append('category', formData.get('category'));
  
  const imageFile = formData.get('image');
  const imageUrl = formData.get('imageUrl');
  
  if (imageFile && imageFile.size > 0) {
    postData.append('image', imageFile);
  } else if (imageUrl) {
    postData.append('imageUrl', imageUrl);
  }

  setPendingPost(Object.fromEntries(postData));
  setIsModalOpen(true);
};

const confirmPost = async () => {
  if (!pendingPost) return;

  try {
    const response = await createPost(pendingPost);
    
    if (currentView === 'home') {
      setAllPosts(prevPosts => [response.data, ...prevPosts]);
      setFilteredPosts(prevPosts => [response.data, ...prevPosts]);
    }
    
    setCurrentView('home');
    setIsModalOpen(false);
    setPendingPost(null);
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post. Please try again.');
  }
};

  
const handleLikePost = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like posts');
      navigate('/login');
      return;
    }

    const response = await likePost(postId);
    
    if (response && response.data) {
      // Update both allPosts and filteredPosts
      const updatePosts = posts => 
        posts.map(post => 
          post._id === postId ? response.data : post
        );
      
      setAllPosts(prevPosts => updatePosts(prevPosts));
      setFilteredPosts(prevPosts => updatePosts(prevPosts));
    }
  } catch (error) {
    console.error('Error liking post:', error);
    const errorMessage = error.response?.data?.message || 'Failed to like/unlike the post. Please try again.';
    alert(errorMessage);
    
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }
};
  
  

const handleAddComment = async (postId, commentText) => {
  try {
    const response = await addComment(postId, commentText);
    
    if (response && response.data) {
      // Update both allPosts and filteredPosts
      const updatePosts = posts => 
        posts.map(post => 
          post._id === postId ? response.data : post
        );
      
      setAllPosts(prevPosts => updatePosts(prevPosts));
      setFilteredPosts(prevPosts => updatePosts(prevPosts));
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Failed to add comment. Please try again.');
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderSidebarButtons = () => {
    return (
      <div className="sidebar-buttons">
        <button
          className={`sidebar-button ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          Home
        </button>
        <button
          className={`sidebar-button ${currentView === 'map' ? 'active' : ''}`}
          onClick={() => setCurrentView('map')}
        >
          <MapIcon size={20} />
          Map
        </button>
        <button
          className={`sidebar-button ${currentView === 'forSaleFree' ? 'active' : ''}`}
          onClick={() => setCurrentView('forSaleFree')}
        >
          For Sale/Free
        </button>
        <button
          className={`sidebar-button ${currentView === 'notifications' ? 'active' : ''}`}
          onClick={() => setCurrentView('notifications')}
        >
          Notifications
        </button>
        <button
          className={`sidebar-button ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          Profile
        </button>
        <button className="sidebar-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  };



const PostCard = ({ post, onLike, onComment }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const MAX_CONTENT_LENGTH = 200;

  const toggleContent = () => setShowFullContent(!showFullContent);
  const toggleComments = () => setShowComments(!showComments);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    handleAddComment(post._id, newComment);
    setNewComment('');
  };

  const getProfilePicUrl = (userId) => {
    return userId ? `http://localhost:8000/api/users/profile/picture/${userId}` : null;
  };

  useEffect(() => {
    const loadImage = async () => {
      try {
        setImageLoadError(false);
        if (post.imageUrl) {
          setImageUrl(post.imageUrl);
        } else if (post._id && post.image && post.image.data) {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `http://localhost:8000/api/posts/${post._id}/image`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          if (response.ok) {
            const blob = await response.blob();
            setImageUrl(URL.createObjectURL(blob));
          } else {
            throw new Error('Failed to load image');
          }
        }
      } catch (error) {
        console.warn('Image load error for post:', post._id);
        setImageLoadError(true);
        setImageUrl('https://via.placeholder.com/300x200?text=Image+Not+Available');
      }
    };

    if ((post.imageUrl || (post.image && post.image.data)) && !imageUrl) {
      loadImage();
    }
  }, [post]);

  const renderContent = () => {
    if (showFullContent || post.content.length <= MAX_CONTENT_LENGTH) {
      return post.content;
    }
    return `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`;
  };

  if (!post || !post.createdBy) {
    return null;
  }


  // styling from here



  return (
    <div className="post-card">
      <div className="post-header">
        <img 
          src={getProfilePicUrl(post.createdBy._id)}
          alt={post.createdBy?.name} 
          className="profile-pic"
          onError={(e) => {
            e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
          }}
        />
        <div>
          <span className="post-author">{post.createdBy?.name}</span>
          <span className="post-timestamp">{formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>

      <div className="post-content">
        <h3>{post.title || 'Untitled Post'}</h3>
        <p>
          {renderContent()}
          {post.content && post.content.length > MAX_CONTENT_LENGTH && (
            <button 
              onClick={toggleContent} 
              className="see-more-btn"
            >
              {showFullContent ? 'See Less' : 'See More'}
            </button>
          )}
        </p>

        {!imageLoadError && imageUrl && (
          <img 
            src={imageUrl}
            alt={post.title || 'Post Image'} 
            className="post-image"
            onError={(e) => {
              setImageLoadError(true);
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
            }}
          />
        )}
      </div>

      <div className="post-interactions">
        <div className="like-section">
          <button 
            onClick={() => handleLikePost(post._id)}
            className="like-btn"
          >
            <span style={{ 
              color: (post.likes && Array.isArray(post.likes) && 
                      user && 
                      post.likes.some(like => 
                        (like._id || like) === user._id
                      )) ? 'red' : 'black' 
            }}>
              👍 {post.likes ? post.likes.length : 0}
            </span>
          </button>
        </div>
      </div>

      <div className="post-comments-section">
        <div className="comment-input-container">
          <input 
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
          />
          <button onClick={handleCommentSubmit} className="comment-send-btn">
            <Send size={20} />
          </button>
        </div>

        <button onClick={toggleComments} className="view-comments-btn">
          <MessageCircle size={20} />
          {post.comments?.length || 0} Comments
        </button>

        {showComments && (
          <div className="comments-list">
            {post.comments?.map((comment, index) => (
              <div key={index} className="comment-item">
                <img 
                  src={getProfilePicUrl(comment.userId?._id)}
                  alt={comment.userName} 
                  className="comment-profile-pic"
                  onError={(e) => {
                    e.target.src = 'https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png';
                  }}
                />
                <div className="comment-content">
                  <span className="comment-author">{comment.userName}</span>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="posts-container">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLikePost}
                onComment={handleAddComment}
              />
            ))}
          </div>
        );
      case 'map':
        return (
          <div className="map-view-container">
            <h2>Neighborhood Map</h2>
            <Map />
          </div>
        );
      case 'forSaleFree':
        return <ForSaleFree />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <ProfileMenu />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <div className="sidebar">
        {renderSidebarButtons()}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
      <div className="dashboard-header">
      
            <ProfileMenu user={user} />
        </div>
        {renderContent()}
      </div>

      <PostConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmPost}
        postDetails={pendingPost || {}}
      />
    </div>
  );
};

export default Dashboard;