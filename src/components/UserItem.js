import React, { useEffect, useState, useContext } from "react";
import RingCentralContext from "../context/ringcentral/ringCentralContext";
import CsvDownload from "react-json-to-csv";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";

const UserItem = ({ user, current }) => {
 const ringCentralContext = useContext(RingCentralContext);

 const { getRangeCalls, clearRangeCalls, userCallLog } = ringCentralContext;
 const [calls, setCalls] = useState(null);
 const [data, setData] = useState(null);
 const [portalState, setPortalState] = useState(false);
 const [startDate, setStartDate] = useState(new Date());
 const [endDate, setEndDate] = useState(new Date());

 useEffect(() => {
  if (
   userCallLog !== null &&
   userCallLog[0].to.extensionId &&
   userCallLog[0].to.extensionId == user.id
  ) {
   console.log("yetters");
   const dat = userCallLog.map(
    ({ from, to, type, direction, startTime, duration, action, result }) => {
     const { phoneNumber } = from;
     const { name } = to;
     let obj = {
      caller: phoneNumber,
      agent: name,
      type,
      direction,
      startTime,
      duration,
      action,
      result,
     };
     return obj;
    }
   );
   setCalls(userCallLog);
   setData(dat);
   clearRangeCalls();
  } else if (
   userCallLog != null &&
   userCallLog[0].from.extensionId &&
   userCallLog[0].from.extensionId == user.id
  ) {
   const dat = userCallLog.map(
    ({ from, to, type, direction, startTime, duration, action, result }) => {
     const { phoneNumber } = from;
     const { name } = to;
     let obj = {
      caller: phoneNumber,
      agent: name,
      type,
      direction,
      startTime,
      duration,
      action,
      result,
     };
     return obj;
    }
   );
   setCalls(userCallLog);
   setData(dat);
   clearRangeCalls();
  }
 }, [userCallLog]);

 console.log(calls);

 const { extensionNumber, name, isActive, currentCall } = user;
 //const { firstName, lastName, company, businessPhone, department } = contact;

 return (
  <div className='card bg-light'>
   <div className={isActive === true ? "grid-2 card" : "card"}>
    <div>
     {" "}
     <h3 className='text-primary'>{name}</h3>
     <h5>{extensionNumber}</h5>
    </div>
    {isActive === true && (
     <div>
      <div className='card bg-dark text-light text-center'>
       Currently on the phone with {currentCall.phoneNumber} for{" "}
       {currentCall.duration}
      </div>
     </div>
    )}
   </div>

   {portalState === false ? (
    <div>
     {calls != null && (
      <div>
       <ul>
        <li>
         Total Outbound Calls:{" "}
         {calls && calls.filter((c) => c.direction === "Outbound").length}
        </li>
        <li>
         Average Outbound Length:{" "}
         {calls &&
          calls.filter((c) => c.direction === "Outbound").length > 0 &&
          calls
           .filter((c) => c.direction === "Outbound")
           .map(({ duration }) => duration)
           .reduce((x, y) => x + y) /
           calls.filter((c) => c.direction === "Outbound").length /
           60}{" "}
         Minutes{" "}
        </li>
        <li>
         Total Inbound Calls:{" "}
         {calls && calls.filter((c) => c.direction === "Inbound").length}
        </li>
        <li>
         {" "}
         Average Inbound Length:{" "}
         {calls &&
          calls.filter((c) => c.direction === "Inbound").length > 0 &&
          (
           calls
            .filter((c) => c.direction === "Inbound")
            .map(({ duration }) => duration)
            .reduce((x, y) => x + y) /
           calls.filter((c) => c.direction === "Inbound").length /
           60
          ).toFixed(2)}{" "}
         Minutes{" "}
        </li>
       </ul>
      </div>
     )}

     <div>
      <div className='grid-2'>
       <div>
        <h5>Start Date</h5>
        <DatePicker
         selected={startDate}
         onChange={(date) => setStartDate(date)}
        />
       </div>

       <div>
        <h5>End Date </h5>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
       </div>
      </div>
      <div className={data != null ? "grid-2" : "text-center"}>
       <button
        className='btn btn-dark'
        onClick={() => getRangeCalls(startDate, endDate, user)}>
        Filter Calls By Date
       </button>

       {data && <CsvDownload className='btn btn-primary' data={data} />}
      </div>
     </div>
    </div>
   ) : (
    <div>
     Call recording library coming soon.
     {/*calls.map((call) => (
      <RecordingItem call={call} id={call.id} />
     ))*/}
    </div>
   )}
   <div className='all-center py-3'>
    {calls && (
     <button
      className='btn btn-dark btn-block'
      onClick={() => setPortalState((prevState) => !prevState)}>
      {portalState === false ? "Open Audio Portal" : "View Call Stats"}
     </button>
    )}
    {calls != null && (
     <button
      className='btn btn-block btn-danger'
      onClick={() => {
       setCalls(null);
       setData(null);
      }}>
      Clear Calls
     </button>
    )}
   </div>
  </div>
 );
};

export default UserItem;
