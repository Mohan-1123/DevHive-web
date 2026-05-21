import userReducer, { addUser, removeUser } from '../userSlice';


test('initial state is null', () => {
  expect(userReducer(undefined, {})).toBe(null);
});

test('addUser sets the user', () => {
  const newState = userReducer(null, addUser({ id: "2", name: "Mohan" }));
  expect(newState).toEqual({ id: "2", name: "Mohan" });
});

test('addUser sets the user', () => {
  const newState = userReducer(null, addUser({ id: "2", name: "Mohan" }));
 expect(newState).toBeDefined()
});

test('removeUser resets to null', () => {
  const newState = userReducer({ id: "2", name: "Mohan" }, removeUser());
  expect(newState).toBeNull();
});

test('addUser checking object property', () => {
  const newState = userReducer(null, addUser({ id: "2", name: "Mohan" }));
  expect(newState).toHaveProperty("name");
});


test('addUser not equal to another user', () => {
  const newState = userReducer(null, addUser({ id: "2", name: "Mohan" }));
  expect(newState).not.toEqual({id:"2",name:"kumar"});
});




