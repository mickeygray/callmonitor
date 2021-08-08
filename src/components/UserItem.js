import React, { useEffect, useState } from "react";
import { sdk } from "../lib";
import CsvDownload from "react-json-to-csv";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RecordingItem from "./RecordingItem";

const UserItem = ({ user, current }) => {
 const [calls, setCalls] = useState(null);
 const [data, setData] = useState(null);
 const [portalState, setPortalState] = useState(false);
 const [startDate, setStartDate] = useState(new Date());
 const [endDate, setEndDate] = useState(new Date());

 useEffect(() => {
  if (calls != null) {
   const dat = calls.map(
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

   setData(dat);
  }
 }, [calls, setData]);

 const getRangeCalls = async (startDate, endDate) => {
  const toIsoString = (date) => {
   var tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num) {
     var norm = Math.floor(Math.abs(num));
     return (norm < 10 ? "0" : "") + norm;
    };

   return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(tzo / 60) +
    ":" +
    pad(tzo % 60)
   );
  };

  const queryParams = {
   dateFrom: toIsoString(new Date(startDate)),
   dateTo: toIsoString(new Date(endDate)),
  };

  const res = await await (
   await sdk.get(
    `/restapi/v1.0/account/~/extension/${user.id}/call-log`,
    queryParams
   )
  ).json();
  setCalls(res.records);
 };

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
        onClick={() => getRangeCalls(startDate, endDate)}>
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
    <button
     className='btn btn-dark btn-block'
     onClick={() => setPortalState((prevState) => !prevState)}>
     {portalState === false ? "Open Audio Portal" : "View Call Stats"}
    </button>
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
