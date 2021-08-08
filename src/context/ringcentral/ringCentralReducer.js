import {
 CLEAR_CURRENT,
 GET_CURRENT,
 SET_USERS,
 SET_CODEVERIFIER,
 SET_QUERY,
 POST_TOKEN,
 REFRESH_TOKEN,
} from "../types";

export default (state, action) => {
 switch (action.type) {
  case CLEAR_CURRENT:
   return {
    ...state,
    current: null,
   };

  case POST_TOKEN:
   return {
    ...state,
    token: action.payload,
   };

  case REFRESH_TOKEN:
   return {
    ...state,
    token: action.payload,
   };
  case SET_USERS:
   return {
    ...state,
    users: action.payload,
   };
  case GET_CURRENT:
   return {
    ...state,
    current: action.payload,
   };
  case SET_QUERY:
   return {
    ...state,
    query: action.payload,
   };
  case SET_CODEVERIFIER:
   return {
    ...state,
    codeVerifier: action.payload,
   };
 }
};
