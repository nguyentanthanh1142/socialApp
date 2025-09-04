import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setToken } from "../../services/localStorageService";
import { Box, CircularProgress, Typography } from "@mui/material";
import {CONFIG} from "../../configurations/configuration";
import {API} from "../../configurations/configuration";
import { outbound } from "../../services/authenticationService";

export default function Authenticate() {
  const navigate = useNavigate();
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);



  const handleSubmit = async (event) => {
    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);
    console.log(authCodeRegex);
    if (isMatch) {
      const authCode = isMatch[1];
    try {
      const response = await outbound(authCode);
      console.log("Response body:", response.data);
      navigate("/");
    } catch (error) {
      const errorResponse = error.response.data;
      setSnackBarMessage(errorResponse.message);
      setSnackBarOpen(true);
    }
  };
}

  useEffect(() => {
    handleSubmit();
  }, []);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/");
    }
  }, [isLoggedin, navigate]);



  // useEffect(() => {
  //   console.log(window.location.href);

    

  //     fetch(
  //       CONFIG.API_GATEWAY + "/"+API.OUTBOUND_AUTHENTICAIe + `?code=${authCode}`,
  //       {
  //         method: "POST",
  //       }
  //     )
  //       .then((response) => {
  //         return response.json();
  //       })
  //       .then((data) => {
  //         console.log(data);

  //         setToken(data.result?.token);
  //         setIsLoggedin(true);
  //       });
  //   }
  // }, []);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/");
    }
  }, [isLoggedin, navigate]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress></CircularProgress>
        <Typography>Authenticating...</Typography>
      </Box>
    </>
  );
}