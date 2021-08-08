import React, { useContext, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { withAuthGate } from "@ringcentral/react"; // change to
import RingCentralContext from "../context/ringcentral/ringCentralContext";

import { sdk } from "../lib";
import Navbar from "../components/Navbar";
import UserList from "./UserList";

const LoggedInWrapper = () => {
 const ringCentralContext = useContext(RingCentralContext);

 const { token, logout, refresh } = ringCentralContext;

 useEffect(() => {
  const timer = setTimeout(() => {
   refresh();
  }, token.expires_in * 1000);
  return () => clearTimeout(timer);
 }, [token]);
 return (
  <div>
   <Navbar logout={logout} token={token} />
   <div className='container'>
    <Switch>
     <Route component={UserList} />
    </Switch>
   </div>
  </div>
 );
};

export default withAuthGate({ sdk, ensure: true })(LoggedInWrapper);
