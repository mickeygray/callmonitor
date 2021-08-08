import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ logout, token }) => {
 return (
  <div className='navbar bg-primary'>
   <h2>Call Monitor</h2>
   {token !== null ? (
    <ul>
     <li>
      <Link to='/app'>User Call Statistics</Link>
      <a className='text-danger lead' onClick={logout} href='#!'>
       <i className='fas fa-sign-out-alt' />{" "}
       <span className='hide-sm'>Logout</span>
      </a>
     </li>
    </ul>
   ) : (
    ""
   )}
  </div>
 );
};

export default Navbar;
