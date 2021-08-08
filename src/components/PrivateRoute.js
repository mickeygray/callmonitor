import React, { useContext } from "react";
import { Route, Redirect, NavLink } from "react-router-dom";
import RingCentralContext from "../context/ringcentral/ringCentralContext";

const PrivateRoute = ({ component: Component, ...rest }) => {
 const ringCentralContext = useContext(RingCentralContext);
 const { token } = ringCentralContext;
 return (
  <Route
   {...rest}
   render={(props) =>
    token === null ? <Redirect to='/login' /> : <Component {...props} />
   }
  />
 );
};

export default PrivateRoute;
