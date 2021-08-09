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
  clearHangUps,
  checkCurrent,
  users,
  current,
 } = ringCentralContext;

 useEffect(() => {
  getUsers();
 }, []);

 console.log(users);

 useEffect(() => {
  const interval = setInterval(() => {
   getCurrentPhoneUsers();
   checkCurrent(users);
   clearHangUps();
  }, 15000);
  return () => clearInterval(interval);
 }, [current]);

 return (
  <div>
   <div className='grid-3'>
    {users != null &&
     users
      .filter((u) => typeof u === "object")
      .map((user) => <UserItem user={user} key={user.id} current={current} />)}
   </div>
  </div>
 );
};

export default UserList;
