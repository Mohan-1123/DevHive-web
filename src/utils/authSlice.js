import { createSlice } from "@reduxjs/toolkit";
import { addUser, removeUser } from "./userSlice";

/*
  status:
    "checking"        — boot-time auth check in flight
    "authenticated"   — user is logged in
    "unauthenticated" — not logged in
*/
const authSlice = createSlice({
  name: "auth",
  initialState: { status: "checking" },
  reducers: {
    setAuthenticated:   (state) => { state.status = "authenticated"; },
    setUnauthenticated: (state) => { state.status = "unauthenticated"; },
  },
  extraReducers: (builder) => {
    // Any addUser action implicitly means authenticated
    builder.addCase(addUser, (state) => { state.status = "authenticated"; });
    builder.addCase(removeUser, (state) => { state.status = "unauthenticated"; });
  },
});

export const { setAuthenticated, setUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
