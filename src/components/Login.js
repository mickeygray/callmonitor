import React, { useContext, useEffect, useState } from "react";
import { withAuthGate } from "@ringcentral/react";
import { sdk } from "../lib";
import Navbar from "./Navbar";
import RingCentralContext from "../context/ringcentral/ringCentralContext";
const Login = ({ authError, loginUrl, authorizing, isAuthorized }) => {
 const ringCentralContext = useContext(RingCentralContext);
 const [encodedUri, setEncodedUri] = useState(null);
 const { query, codeVerifier, createCodeChallenge, createCodeVerifier } =
  ringCentralContext;

 console.log(sdk);
 useEffect(() => {
  if (codeVerifier === null) {
   createCodeVerifier();
  } else if (codeVerifier !== null && query === null) {
   localStorage.setItem("codeVerifier", codeVerifier);
   createCodeChallenge(codeVerifier);
  } else if (query !== null) {
   let oidcURL = `${process.env.REACT_APP_SERVER}/restapi/oauth/authorize`;
   let queryParams = [
    `client_id=${query.clientId}`,
    `code_challenge=${query.code_challenge}`,
    `redirect_uri=${query.redirect}`,
    `code_challenge_method=${query.code_challenge_method}`,
    `response_type=code`,
   ];

   setEncodedUri(`${oidcURL}?${queryParams.join("&")}`);
  }
 }, [codeVerifier, query, ringCentralContext]);

 const login = () => window.location.assign(encodedUri);

 return (
  <div>
   <Navbar isAuthorized={isAuthorized} />
   <div className='card all-center bg-light'>
    {authError && <p>Auth error: {authError}</p>}
    {encodedUri !== null ? (
     <button type='button' onClick={login} className='btn btn-dark'>
      Log in with RingCentral
     </button>
    ) : (
     ""
    )}
   </div>
  </div>
 );
};

export default withAuthGate({ sdk })(Login);
