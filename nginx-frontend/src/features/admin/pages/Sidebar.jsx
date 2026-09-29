import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { 
  Security as ShieldIcon,          
  Dashboard as DashboardIcon,      
  People as UsersIcon, 
  Article as PostsIcon,
  History as AuditLogIcon          
} from '@mui/icons-material'; 

const Sidebar = () => {
  return (
    <Box component="aside" className="admin-sidebar text-white" sx={{ width: 'var(--sidebar-width, 240px)', minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Brand Header */}
      <Box sx={{ px: 3, py: 4, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShieldIcon sx={{ color: '#2563eb' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
          NTT Admin
        </Typography>
      </Box>

      {/* Nav List */}
      <List sx={{ px: 2, pt: 2 }}>
        {/* Dashboard */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={NavLink} 
            to="/admin" 
            end
            sx={{
              borderRadius: '0.5rem',
              color: 'rgba(255, 255, 255, 0.75)',
              '&.active': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              },
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '36px' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* Users */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={NavLink} 
            to="/admin/users"
            sx={{
              borderRadius: '0.5rem',
              color: 'rgba(255, 255, 255, 0.75)',
              '&.active': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              },
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '36px' }}>
              <UsersIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>
        </ListItem>

        {/* Posts */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={NavLink} 
            to="/admin/posts"
            sx={{
              borderRadius: '0.5rem',
              color: 'rgba(255, 255, 255, 0.75)',
              '&.active': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              },
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '36px' }}>
              <PostsIcon />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItemButton>
        </ListItem>

        {/* Audit Logs (Mục mới thêm) */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={NavLink} 
            to="/admin/audit-logs"
            sx={{
              borderRadius: '0.5rem',
              color: 'rgba(255, 255, 255, 0.75)',
              '&.active': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              },
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '36px' }}>
              <AuditLogIcon />
            </ListItemIcon>
            <ListItemText primary="Audit Logs" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;