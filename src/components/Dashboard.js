import React from "react";
import { sdk } from "../lib";

export default class Dashboard extends React.Component {
 constructor(props) {
  super(props);
  this.state = { user: null, error: null, calllog: null, activeCalls: null };
 }

 async componentDidMount() {
  try {
   function toIsoString(date) {
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
   }

   const queryParams = {
    dateFrom: toIsoString(new Date("7/1/2021")),
    dateTo: toIsoString(new Date("7/15/2021")),
    view: "Simple",
    recordingType: "All",
    withRecording: true,
   };
   this.setState({
    user: await (await sdk.get("/restapi/v1.0/account/~/extension/")).json(),
    calllog: await (
     await sdk.get("/restapi/v1.0/account/~/call-log", queryParams)
    ).json(),
    activeCalls: await (
     await sdk.get("/restapi/v1.0/account/~/active-calls")
    ).json(),
   });
  } catch (error) {
   this.setState({ error });
  }
 }

 render() {
  const { error, user, calllog, activeCalls } = this.state;
  if (error) return <div>{error.message}</div>;
  if (!user) return <div>Loading</div>;
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
 }
}
