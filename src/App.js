import React from "react";
import {
 BrowserRouter as Router,
 Redirect,
 Route,
 Switch,
} from "react-router-dom";
import LoggedInWrapper from "./components/LoggedInWrapper";
import LoggedOutWrapper from "./components/LoggedOutWrapper";
import RingCentralState from "./context/ringcentral/RingCentralState";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const App = () => {
 return (
  <RingCentralState>
   {" "}
   <div>
    <Router>
     <Switch>
      <PrivateRoute path='/app' component={LoggedInWrapper} />
      <Route path='/api' component={LoggedOutWrapper} />
      <Redirect from='/' to='/api/login' />
     </Switch>
    </Router>
   </div>
  </RingCentralState>
 );
};

export default App;
