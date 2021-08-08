import SDK from "@ringcentral/sdk";

const redirectUri = `${window.location.origin}/api/redirect`; // make sure you have this configured in Dev Portal

export const sdk = new SDK({
 appName: "Call Monitor",
 appVersion: "1.0.0",
 server: process.env.REACT_APP_SERVER,
 clientId: process.env.REACT_APP_CLIENT_ID,
 clientSecret: process.env.REACT_APP_CLIENT_SECRET,
 redirectUri,
});
