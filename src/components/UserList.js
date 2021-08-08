import React, { useEffect, useState, useContext } from "react";
import { sdk } from "../lib";
import UserItem from "./UserItem";
import RingCentralContext from "../context/ringcentral/ringCentralContext";
const UserList = () => {
 const ringCentralContext = useContext(RingCentralContext);

 const {
  getUsers,
  getCurrentPhoneUsers,
  getUserNumbers,
  checkCurrent,
  users,
  current,
 } = ringCentralContext;

 console.log(users);

 useEffect(() => {
  getUsers();
 }, []);

 useEffect(() => {
  const interval = setInterval(() => {
   getCurrentPhoneUsers();
   checkCurrent(users);
  }, 15000);
  return () => clearInterval(interval);
 }, [current]);

 return (
  <div>
   <div className='grid-3'>
    {users != null &&
     users.map((user) => (
      <UserItem user={user} key={user.id} current={current} />
     ))}
   </div>
  </div>
 );
};

export default UserList;
