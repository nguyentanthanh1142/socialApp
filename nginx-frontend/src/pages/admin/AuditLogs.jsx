import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  Chip, CircularProgress 
} from '@mui/material';
import { getRecentAudits } from '../../services/admin/adminService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await getRecentAudits(page + 1, rowsPerPage);
        
        // Dựa trên JSON response bạn cung cấp: { code: 1000, result: { data: [], totalElements: 5 } }
        // Chúng ta lấy object 'result'
        const result = response?.result || {};
        
        setLogs(result.data || []);
        setTotalElements(result.totalElements || 0);
      } catch (error) {
        console.error("Failed to load audit logs", error);
        setLogs([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#0f172a' }}>
        Audit Logs Management
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: '0.85rem', border: '1px solid rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{log.id.slice(-8)}</TableCell>
                    <TableCell>{log.adminUsername || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{log.targetType} <Typography component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{log.targetId ? `(${log.targetId.slice(-6)})` : ''}</Typography></TableCell>
                    <TableCell>
                      <Chip 
                        label={log.success ? "SUCCESS" : "FAILED"} 
                        size="small" 
                        color={log.success ? "success" : "error"} 
                      />
                    </TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 8, 15, 25]}
        />
      </Paper>
    </Box>
  );
};

export default AuditLogs;