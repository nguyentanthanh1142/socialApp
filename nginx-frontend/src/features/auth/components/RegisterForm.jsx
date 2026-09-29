import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function RegisterForm({
  username,
  setUsername,
  password,
  setPassword,
  email,
  setEmail,
  snackBarOpen,
  snackBarMessage,
  snackBarSeverity,
  handleCloseSnackBar,
  handleSubmit,
}) {
  return (
    <>
      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackBarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor={"#f0f2f5"}
      >
        <Card
          sx={{
            minWidth: 400,
            maxWidth: 500,
            boxShadow: 4,
            borderRadius: 4,
            padding: 4,
          }}
        >
          <CardContent>
            <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
              Create your account
            </Typography>
            <Box
              component="form"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              width="100%"
              onSubmit={handleSubmit}
            >
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{
                  mt: "15px",
                  mb: "25px",
                }}
              >
                Create an account
              </Button>
              <Divider sx={{ width: "100%", mb: 2 }} />
            </Box>

            <Box display="flex" flexDirection="column" width="100%" gap="25px">
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                component={Link}
                to="/login"
                sx={{ gap: "10px" }}
              >
                Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

RegisterForm.propTypes = {
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  city: PropTypes.string.isRequired,
  setCity: PropTypes.func.isRequired,
  firstname: PropTypes.string.isRequired,
  setFirstName: PropTypes.func.isRequired,
  lastname: PropTypes.string.isRequired,
  setLastName: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  birthday: PropTypes.string.isRequired,
  setBirthDay: PropTypes.func.isRequired,
  snackBarOpen: PropTypes.bool.isRequired,
  snackBarMessage: PropTypes.string.isRequired,
  snackBarSeverity: PropTypes.string.isRequired,
  handleCloseSnackBar: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};