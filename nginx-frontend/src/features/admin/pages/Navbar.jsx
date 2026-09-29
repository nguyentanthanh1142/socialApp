import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminLogOut } from '../../../services/admin/adminAuthService'; 

const Navbar = ({ pageTitle = "Dashboard", adminName = "admin", onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await adminLogOut();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate('/admin/login');
    }
  };

  return (
    <Box 
      component="header" 
      className="admin-navbar"
      sx={{ 
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)', 
        backgroundColor: '#fff', 
        px: 4, 
        py: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}
    >
      <div>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0 }}>
          {pageTitle}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Admin Management Console
        </Typography>
      </div>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          component="span" 
          sx={{ 
            backgroundColor: '#2563eb', 
            color: '#fff', 
            px: 1.5, 
            py: 0.5, 
            borderRadius: '4px', 
            fontSize: '0.85rem', 
            fontWeight: 600 
          }}
        >
          {adminName}
        </Box>

        <Button 
          variant="outlined" 
          size="small" 
          color="secondary"
          onClick={handleLogoutClick} 
          startIcon={<LogoutIcon />}
          sx={{ textTransform: 'none' }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;