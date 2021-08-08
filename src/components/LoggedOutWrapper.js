import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { withAuthGate } from "@ringcentral/react";
import OauthRedirect from "./OauthRedirect";
import Login from "./Login";
import { sdk } from "../lib";

const LoggedOutWrapper = ({
 isAuthorized,
 authorizing,
 authError,
 match,
 location,
}) => {
 if (authorizing) {
  return <div>Loading</div>;
 }

 if (isAuthorized) {
  const { from } = location.state || { from: { pathname: "/app" } };
  console.log("Redirecting to", from);
  return <Redirect to={from} />;
 }

 return (
  <Switch>
   <Route
    path={`${match.url}/login`}
    exact
    component={Login}
    isAuthorized={isAuthorized}
   />
   <Route path={`${match.url}/redirect`} exact component={OauthRedirect} />
  </Switch>
 );
};

export default withAuthGate({ sdk, ensure: true })(LoggedOutWrapper);
