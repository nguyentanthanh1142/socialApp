import { Tabs, Tab, Box } from "@mui/material";

export default function ProfileTabs({ tab, setTab }) {
  const handleChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    <Box
      sx={{
        mt: 1,
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        px: 1,
      }}
    >
      <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
        <Tab label="Posts" />
        <Tab label="Friends" />
        <Tab label="Photos" />
      </Tabs>
    </Box>
  );
}
