import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, CircularProgress, Chip 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getPosts, deletePost } from '../../services/admin/adminService';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getPosts(page, size);
        
        // Trích xuất mảng post từ cấu trúc response.result.data (giống UserManagement)
        const postList = response?.result?.data || [];
        setPosts(postList);
      } catch (error) {
        console.error("Failed to fetch posts", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, size]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Soft-delete this post?')) return;
    try {
      await deletePost(postId);
      // Cập nhật trạng thái post thành đã xóa (deleted: true) thay vì lọc bỏ hoàn toàn giống bản cũ
      setPosts(posts.map(post => post.id === postId ? { ...post, deleted: true } : post));
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#0f172a' }}>
        Post Moderation
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Content</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell sx={{ maxWidth: '360px' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        fontWeight: 500,
                        color: '#0f172a'
                      }}>
                        {post.content}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {post.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.username || post.userId || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {post.createDate ? new Date(post.createDate).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={post.deleted ? "DELETED" : "ACTIVE"} 
                        size="small" 
                        color={post.deleted ? "default" : "success"} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      {!post.deleted ? (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </Button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Already deleted</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PostManagement;