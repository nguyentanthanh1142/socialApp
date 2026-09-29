import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, CircularProgress, Chip 
} from '@mui/material';
import { getUsers, banUser, unbanUser } from '../../services/admin/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers(page, size);
        
        // Lấy chính xác mảng danh sách từ response.result.data
        const userList = response?.result?.data || [];
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, size]);

  const handleBan = async (userId) => {
    try {
      await banUser(userId);
      setUsers(users.map(user => user.id === userId ? { ...user, status: 'BANNED' } : user));
    } catch (error) {
      console.error("Failed to ban user", error);
    }
  };

  const handleUnban = async (userId) => {
    try {
      await unbanUser(userId);
      setUsers(users.map(user => user.id === userId ? { ...user, status: 'ACTIVE' } : user));
    } catch (error) {
      console.error("Failed to unban user", error);
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
        User Management
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 600, align: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => {
                  const isBanned = user.status === 'BANNED';
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{user.username}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          color={isBanned ? "error" : "success"} 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map(r => r.name).join(', ')
                        ) : (
                          <span style={{ color: '#94a3b8' }}>USER</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isBanned ? (
                          <Button 
                            variant="outlined" 
                            color="success" 
                            size="small"
                            onClick={() => handleUnban(user.id)}
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleBan(user.id)}
                          >
                            Ban
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                    No users found.
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

export default UserManagement;