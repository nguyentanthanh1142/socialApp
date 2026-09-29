import { createContext, useContext } from "react";

export const AdminAuthContext = createContext({
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export const useAdminAuthContext = () => useContext(AdminAuthContext);

export default AdminAuthContext;
