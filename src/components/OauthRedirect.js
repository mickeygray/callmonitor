import React, { useContext, useEffect } from "react";
import { withAuthGate } from "@ringcentral/react"; // change to
import { sdk } from "../lib";
import { useHistory, useLocation } from "react-router-dom";

import RingCentralContext from "../context/ringcentral/ringCentralContext";

const OauthRedirect = () => {
 const { search } = useLocation();
 const history = useHistory();
 const ringCentralContext = useContext(RingCentralContext);

 const { postToken, token } = ringCentralContext;

 console.log(token);

 useEffect(() => {
  if (token === null) {
   const code = search.replace("?code=", "");
   postToken(code);
  } else {
   history.push("/app");
  }
 }, [token]);

 return <div>Redirecting...</div>;
};

export default withAuthGate({ sdk })(OauthRedirect);
