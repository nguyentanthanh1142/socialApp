import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    adminService.getPosts().then(setPosts);
  }, []);

  return (
    <div className="posts">
      <h2>Post Moderation</h2>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        <ul>
          {posts.map((post, index) => (
            <li key={index}>{post.content} by {post.username}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Posts;