import React, { useState, useEffect } from "react";
import { sdk } from "../lib";
const download = require("downloadjs");
const RecordingItem = ({ call }) => {
 const [recording, setRecording] = useState(null);

 const getRecording = async (id) => {
  const res = await await await sdk.get(
   `/restapi/v1.0/account/~/recording/${id}/content`
  );
  setRecording(res);
  download(recording);
 };

 const { to, from, direction, duration, startTime } = call;

 return (
  <div>
   <ul>
    <li> To: {to.name}</li>
    <li>From: {from.phoneNumber}</li>
    <li>Direction: {direction}</li>
    <li>Duration: {duration} seconds</li>
    <li>
     Date And Time:{" "}
     {Intl.DateTimeFormat(
      "fr-CA",
      { timeZone: "America/Los_Angeles" },
      {
       timeStyle: "medium",
       dateStyle: "short",
      }
     ).format(new Date(startTime))}
    </li>
   </ul>

   <button onClick={() => getRecording(call.id)}>Download Call</button>
  </div>
 );
};

export default RecordingItem;
