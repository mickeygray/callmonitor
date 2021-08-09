import React, { useReducer } from "react";
import RingCentralContext from "./ringCentralContext";
import ringCentralReducer from "./ringCentralReducer";
import { sdk } from "../../lib";
import { randomBytes, createHash } from "crypto";
import { Base64 } from "js-base64";
import qs from "qs";
import URI from "urijs";
import axios from "axios";
import {
 GET_CURRENT,
 SET_USERS,
 CLEAR_CURRENT,
 SET_CODEVERIFIER,
 SET_QUERY,
 POST_TOKEN,
 CLEAR_TOKEN,
 REFRESH_TOKEN,
 SET_CURRENTCALLS,
 SET_USERCALLLOG,
 CLEAR_USERCALLLOG,
} from "../types";

const RingCentralState = (props) => {
 const initialState = {
  users: null,
  current: null,
  userCallLog: null,
  currentCalls: null,
  codeVerifier: null,
  query: null,
  token: null,
 };

 const [state, dispatch] = useReducer(ringCentralReducer, initialState);

 const { current, token, currentCalls } = state;

 const getUsers = async () => {
  const res = await axios
   .request({
    method: "get",
    url: parseUrl(
     process.env.REACT_APP_SERVER,
     `/restapi/v1.0/account/~/extension/`
    ).toString(),
    headers: {
     Authorization: `bearer ${token.access_token}`,
    },
   })
   .catch((error) => {
    if (error.response) {
     console.log(error.response.data); // => the response payload
    }
   });

  console.log(res);
  const users = res.data.records.filter((u) => u.type === "User");

  getUserNumbers(users);
 };

 const refresh = async () => {
  const res = await axios.request({
   method: "post",
   url: parseUrl(
    process.env.REACT_APP_SERVER,
    "/restapi/oauth/token"
   ).toString(),
   data: qs.stringify({
    grant_type: "refresh_token",
    refresh_token: token.refresh_token,
    client_id: process.env.REACT_APP_CLIENT_ID,
   }),
   headers: {
    Authorization: `Basic ${Base64.encode(
     `${process.env.REACT_APP_CLIENT_ID}:${process.env.REACT_APP_CLIENT_SECRET}`
    )}`,
   },
  });
  dispatch({ type: REFRESH_TOKEN, payload: res.data });
 };

 const createCodeVerifier = () => {
  let codeVerifier = randomBytes(32);
  codeVerifier = codeVerifier
   .toString("base64")
   .replace(/\+/g, "-")
   .replace(/\//g, "_")
   .replace(/=/g, "");

  console.log(codeVerifier);
  dispatch({ type: SET_CODEVERIFIER, payload: codeVerifier });
 };

 const parseUrl = (uri, path) => {
  const u = URI(uri);
  const pathJoined = URI.joinPaths(u, path);
  return u.path(pathJoined);
 };

 const postToken = async (code) => {
  const data = qs.stringify({
   grant_type: "authorization_code",
   code,
   redirect_uri: process.env.REACT_APP_REDIRECT_URI,
   code_verifier: localStorage.getItem("codeVerifier"),
   client_id: process.env.REACT_APP_CLIENT_ID,
  });

  const res = await axios
   .request({
    method: "post",
    url: parseUrl(
     process.env.REACT_APP_SERVER,
     "/restapi/oauth/token"
    ).toString(),
    data,
    headers: {
     Authorization: `Basic ${Base64.encode(
      `${process.env.REACT_APP_CLIENT_ID}:${process.env.REACT_APP_CLIENT_SECRET}`
     )}`,
    },
   })
   .catch((error) => {
    if (error.response) {
     console.log(error.response.data); // => the response payload
    }
   });

  dispatch({
   type: SET_CODEVERIFIER,
   payload: localStorage.getItem("codeVerifier"),
  });
  localStorage.removeItem("codeVerifier");
  dispatch({ type: POST_TOKEN, payload: res.data });
 };

 const logout = async () => {
  await axios.request({
   method: "post",
   url: parseUrl(
    process.env.REACT_APP_SERVER,
    "/restapi/oauth/revoke"
   ).toString(),
   data: qs.stringify({
    token: `${token.access_token}`,
   }),
   headers: {
    Authorization: `Basic ${Base64.encode(
     `${process.env.REACT_APP_CLIENT_ID}:${process.env.REACT_APP_CLIENT_SECRET}`
    )}`,
   },
  });

  dispatch({ type: CLEAR_TOKEN });
 };

 const createCodeChallenge = (codeVerifier) => {
  let query = {};
  query.code_challenge = createHash("sha256")
   .update(codeVerifier)
   .digest()
   .toString("base64")
   .replace(/\+/g, "-")
   .replace(/\//g, "_")
   .replace(/=/g, "");
  query.code_challenge_method = "S256";
  query.clientId = process.env.REACT_APP_CLIENT_ID;
  query.redirect = process.env.REACT_APP_REDIRECT_URI;

  console.log(query);
  dispatch({ type: SET_QUERY, payload: query });
 };

 const getRangeCalls = async (startDate, endDate, user) => {
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
  const queryParams = qs.stringify({
   dateFrom: toIsoString(new Date(startDate)),
   dateTo: toIsoString(new Date(endDate)),
  });

  const res = await axios.request({
   method: "get",
   url: parseUrl(
    process.env.REACT_APP_SERVER,
    `/restapi/v1.0/account/~/extension/${user.id}/call-log`
   ).toString(),
   queryParams,
   headers: {
    Authorization: `bearer ${token.access_token}`,
   },
  });

  dispatch({ type: SET_USERCALLLOG, payload: res.data.records });
 };

 const getUserNumbers = async (users) => {
  const newUsers = [];
  for (const user of users) {
   if (!user.phoneList) {
    setTimeout(async function () {
     const res = await axios.request({
      method: "get",
      url: parseUrl(
       process.env.REACT_APP_SERVER,
       `/restapi/v1.0/account/~/extension/${user.id}/phone-number`
      ).toString(),
      headers: {
       Authorization: `bearer ${token.access_token}`,
      },
     });

     const newUser = {
      ...user,
      phoneList: res.data.records.filter((p) => p.usageType === "DirectNumber"),
     };

     newUsers.push(newUser);
     dispatch({ type: SET_USERS, payload: newUsers });
    }, 10000);
   }
  }
 };

 const getCurrentPhoneUsers = async () => {
  const res = await axios.request({
   method: "get",
   url: parseUrl(
    process.env.REACT_APP_SERVER,
    `/restapi/v1.0/account/~/active-calls/`
   ).toString(),
   headers: {
    Authorization: `bearer ${token.access_token}`,
   },
  });

  const current = res.data.records.filter((c) => c.result === "In Progress");

  if (current.length > 0) {
   dispatch({ type: GET_CURRENT, payload: current });
  } else {
   dispatch({ type: CLEAR_CURRENT });
  }
 };

 const checkCurrent = async (users) => {
  if (current != null) {
   const currentCalls = [];
   for (let i = 0; i < current.length; i++) {
    const res = await axios.request({
     method: "get",
     url: parseUrl(
      process.env.REACT_APP_SERVER,
      `/restapi/v1.0/account/~/telephony/sessions/${current[i].telephonySessionId}`
     ).toString(),
     headers: {
      Authorization: `Bearer ${token.access_token}`,
     },
    });

    const currentTelephonySession = res.data;

    console.log(current[i]);
    console.log(currentTelephonySession);

    if (currentTelephonySession !== undefined) {
     const currentCallData = {
      to:
       [
        ...new Set([
         current[i].to.phoneNumber,
         ...currentTelephonySession.parties.map(({ to }) => to.phoneNumber),
        ]),
       ].length === 1
        ? current[i].to.phoneNumber
        : [
           ...new Set([
            current[i].to.phoneNumber,
            ...currentTelephonySession.parties.map(({ to }) => to.phoneNumber),
           ]),
          ],
      from:
       [
        ...new Set([
         current[i].from.phoneNumber,
         ...currentTelephonySession.parties.map(({ from }) => from.phoneNumber),
        ]),
       ].length === 1
        ? current[i].from.phoneNumber
        : [
           ...new Set([
            current[i].from.phoneNumber,
            ...currentTelephonySession.parties.map(
             ({ from }) => from.phoneNumber
            ),
           ]),
          ],
      telephonySessionId: current[i].telephonySessionId,
      direction: current[i].direction,
      startTime: current[i].startTime,
     };

     console.log(currentCallData);
     console.log(users);

     let newUser;
     if (currentCallData.direction === "Inbound") {
      if (Array.isArray(currentCallData.to)) {
       newUser = users
        .filter((u) =>
         currentCallData.to.some((r) =>
          u.phoneList.map(({ phoneNumber }) => phoneNumber).includes(r)
         )
        )
        .map((u) => {
         let obj = {
          duration:
           (Date.now() - new Date(currentCallData.startTime).getTime()) / 1000 >
           60
            ? `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60
              )} minutes and ${parseInt(
               (((Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60) %
                1) *
                60
              )} seconds`
            : `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000
              )} seconds`,
          phoneNumber: currentCallData.from[0],
         };

         let user = {
          ...u,
          isActive: true,
          currentCall: obj,
         };

         return user;
        });
      } else {
       newUser = users
        .filter((u) =>
         u.phoneList
          .map(({ phoneNumber }) => phoneNumber)
          .includes(currentCallData.to)
        )
        .map((u) => {
         let obj = {
          duration:
           (Date.now() - new Date(currentCallData.startTime).getTime()) / 1000 >
           60
            ? `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60
              )} minutes and ${parseInt(
               (((Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60) %
                1) *
                60
              )} seconds`
            : `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000
              )} seconds`,
          phoneNumber: currentCallData.from,
         };

         let user = {
          ...u,
          isActive: true,
          currentCall: obj,
         };

         return user;
        });
      }

      const filteredUsers = users.filter((u) => u.id !== newUser[0].id);
      const newUsers = [...newUser, ...filteredUsers];

      dispatch({ type: SET_USERS, payload: newUsers });
     } else if (currentCallData.direction === "Outbound") {
      if (Array.isArray(currentCallData.from)) {
       newUser = users
        .filter((u) =>
         currentCallData.from.some((r) =>
          u.phoneList.map(({ phoneNumber }) => phoneNumber).includes(r)
         )
        )
        .map((u) => {
         let obj = {
          duration:
           (Date.now() - new Date(currentCallData.startTime).getTime()) / 1000 >
           60
            ? `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60
              )} minutes and ${parseInt(
               (((Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60) %
                1) *
                60
              )} seconds`
            : `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000
              )} seconds`,
          phoneNumber: currentCallData.to[0],
         };

         let user = {
          ...u,
          isActive: true,
          currentCall: obj,
         };

         return user;
        });
      } else {
       newUser = users
        .filter((u) =>
         u.phoneList
          .map(({ phoneNumber }) => phoneNumber)
          .includes(currentCallData.from)
        )
        .map((u) => {
         let obj = {
          duration:
           (Date.now() - new Date(currentCallData.startTime).getTime()) / 1000 >
           60
            ? `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60
              )} minutes and ${parseInt(
               (((Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000 /
                60) %
                1) *
                60
              )} seconds`
            : `${parseInt(
               (Date.now() - new Date(currentCallData.startTime).getTime()) /
                1000
              )} seconds`,
          phoneNumber: currentCallData.to,
         };

         let user = {
          ...u,
          isActive: true,
          currentCall: obj,
         };

         return user;
        });
      }

      const filteredUsers = users.filter((u) => u.id !== newUser[0].id);
      const newUsers = [...newUser, ...filteredUsers];

      dispatch({ type: SET_USERS, payload: newUsers });
     }
     currentCalls.push(currentCallData);

     dispatch({ type: SET_CURRENTCALLS, payload: currentCalls });
    }
   }
  }
 };

 const clearHangUps = () => {
  if (current === null && currentCalls !== null) {
   const activeUsers = state.users
    .filter((u) => u.isActive === true)
    .map((u) => (u.isActive = false));

   const uniqueUsers = [...activeUsers, ...state.users].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
   );

   dispatch({ type: SET_USERS, payload: uniqueUsers });
  } else if (current !== null && currentCalls !== null) {
   const currentSessions = current.map(
    ({ telephonySessionId }) => telephonySessionId
   );

   const updatedCurrentCalls = currentCalls.filter((u) =>
    currentSessions.some((r) =>
     currentCalls
      .map(({ telephonySessionId }) => telephonySessionId)
      .includes(r)
    )
   );

   console.log(updatedCurrentCalls);

   dispatch({ type: SET_CURRENTCALLS, payload: updatedCurrentCalls });
   const activeUsers = state.users
    .filter((u) => u.isActive === true)
    .map((u) => u.phoneList.map(({ phoneNumber }) => phoneNumber))
    .flat();

   const currentNumbers = currentCalls
    .map(({ to, from }) => {
     const newArr = [];

     if (Array.isArray(to)) {
      for (let i = 0; i < to.length; i++) {
       newArr.push(to[i]);
      }
     } else {
      newArr.push(to);
     }

     if (Array.isArray(from)) {
      for (let i = 0; i < from.length; i++) {
       newArr.push(from[i].phoneNumber);
      }
     } else {
      newArr.push(from);
     }

     return newArr;
    })
    .flat();

   const noLongerActive = activeUsers.filter(
    (x) => !currentNumbers.includes(x)
   );

   console.log(activeUsers);
   console.log(currentNumbers);
   console.log(noLongerActive);

   const newUsers = state.users
    .filter((u) => noLongerActive.some((r) => u.phoneList.includes(r)))
    .map((u) => {
     let obj = {
      ...u,
      currentCall: null,
      isActive: false,
     };
     return obj;
    });

   const filteredUsers = [...state.users, ...newUsers].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
   );

   console.log(filteredUsers);

   dispatch({ type: SET_USERS, payload: filteredUsers });
  }
 };

 const setUsers = (users) => {
  dispatch({ type: SET_USERS, payload: users });
 };

 const clearRangeCalls = () => {
  dispatch({ type: CLEAR_USERCALLLOG });
 };

 return (
  <RingCentralContext.Provider
   value={{
    getUsers,
    getCurrentPhoneUsers,
    getUserNumbers,
    checkCurrent,
    clearHangUps,
    setUsers,
    createCodeVerifier,
    createCodeChallenge,
    getRangeCalls,
    clearRangeCalls,
    postToken,
    logout,
    refresh,
    query: state.query,
    codeVerifier: state.codeVerifier,
    currentCalls: state.currentCalls,
    userCallLog: state.userCallLog,
    users: state.users,
    current: state.current,
    token: state.token,
   }}>
   {props.children}
  </RingCentralContext.Provider>
 );
};

export default RingCentralState;
