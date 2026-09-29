import React from "react";

const LazyAdminDashboard = React.lazy(() =>
  import("../pages/admin/Dashboard")
);

export default LazyAdminDashboard;
