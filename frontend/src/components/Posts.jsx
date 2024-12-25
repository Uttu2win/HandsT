import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Announcements', imageUrl: '', likes: 0 });

  // Fetch all posts
  useEffect(() => {
    axios.get('/api/posts')
      .then(response => setPosts(response.data))
      .catch(error => console.error(error));
  }, []);

  // Handle new post creation
  const handleCreatePost = () => {
    axios.post('/api/posts', newPost)
      .then(response => setPosts([...posts, response.data]))
      .catch(error => console.error(error));
  };

  // Handle like post
  const handleLike = (postId) => {
    axios.put(`/api/posts/like/${postId}`)
      .then(response => {
        const updatedPosts = posts.map(post => post._id === postId ? response.data : post);
        setPosts(updatedPosts);
      })
      .catch(error => console.error(error));
  };

  // Handle delete post
  const handleDelete = (postId) => {
    axios.delete(`/api/posts/${postId}`)
      .then(() => {
        const updatedPosts = posts.filter(post => post._id !== postId);
        setPosts(updatedPosts);
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Posts</h1>
      <div>
        <h2>Create Post</h2>
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Content"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newPost.category}
          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newPost.imageUrl}
          onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
        />
        <button onClick={handleCreatePost}>Create Post</button>
      </div>

      <div>
        <h2>All Posts</h2>
        {posts.map((post) => (
          <div key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>Category: {post.category}</p>
            <img src={post.imageUrl} alt={post.title} width="200" />
            <p>Likes: {post.likes}</p>
            <button onClick={() => handleLike(post._id)}>Like</button>
            <button onClick={() => handleDelete(post._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
