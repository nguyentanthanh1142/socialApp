import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { 
  People as PeopleIcon, 
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon, 
  Article as ArticleIcon,
  LibraryBooks as LibraryBooksIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { getDashboardStats } from '../../services/admin/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        // Kiểm tra nếu API bọc trong cấu trúc ApiResponse (ví dụ data.result)
        // Nếu getDashboardStats đã trả về thẳng object result thì bạn đổi lại thành setStats(data)
        setStats(data?.result ?? data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#0f172a' }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* 1. Total Users */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box>
              <Typography variant="body2" sx={labelStyle}>Total Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {stats?.totalUsers ?? 0}
              </Typography>
            </Box>
            <Box sx={{ ...iconBoxStyle, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <PeopleIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        {/* 2. Active Users */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box>
              <Typography variant="body2" sx={labelStyle}>Active Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#16a34a' }}>
                {stats?.activeUsers ?? 0}
              </Typography>
            </Box>
            <Box sx={{ ...iconBoxStyle, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        {/* 3. Banned Users */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box>
              <Typography variant="body2" sx={labelStyle}>Banned Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#dc2626' }}>
                {stats?.bannedUsers ?? 0}
              </Typography>
            </Box>
            <Box sx={{ ...iconBoxStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <BlockIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        {/* 4. Total Posts */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box>
              <Typography variant="body2" sx={labelStyle}>Total Posts</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {stats?.totalPosts ?? 0}
              </Typography>
            </Box>
            <Box sx={{ ...iconBoxStyle, backgroundColor: '#f8fafc', color: '#475569' }}>
              <ArticleIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        {/* 5. Active Posts */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box>
              <Typography variant="body2" sx={labelStyle}>Active Posts</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563eb' }}>
                {stats?.activePosts ?? 0}
              </Typography>
            </Box>
            <Box sx={{ ...iconBoxStyle, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <LibraryBooksIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        {/* 6. Deleted Posts */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box>
              <Typography variant="body2" sx={labelStyle}>Deleted Posts</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#d97706' }}>
                {stats?.deletedPosts ?? 0}
              </Typography>
            </Box>
            <Box sx={{ ...iconBoxStyle, backgroundColor: '#fffbeb', color: '#d97706' }}>
              <DeleteSweepIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// CSS Styles tái sử dụng cho các thẻ Card để code gọn gàng hơn
const cardStyle = {
  p: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '1rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': { 
    transform: 'translateY(-4px)', 
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
    borderColor: '#cbd5e1'
  }
};

const labelStyle = {
  color: '#64748b', 
  fontWeight: 600, 
  mb: 1, 
  textTransform: 'uppercase', 
  letterSpacing: '0.5px'
};

const iconBoxStyle = {
  p: 2, 
  borderRadius: '0.75rem', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center'
};

export default Dashboard;