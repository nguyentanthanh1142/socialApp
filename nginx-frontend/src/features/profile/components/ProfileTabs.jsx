import { Tabs, Tab, Box } from "@mui/material";

export default function ProfileTabs({ tab, setTab }) {
  const handleChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="Posts" />
        <Tab label="Friends" />
        <Tab label="Photos" />
      </Tabs>
    </Box>
  );
}
