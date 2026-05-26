import store from '../appStore';
import { addUser, removeUser } from '../userSlice';

beforeAll(() => {
  console.log('--- store tests started ---');
});

afterAll(() => {
  console.log('--- store tests finished ---');
});

beforeEach(() => {
  store.dispatch(removeUser());
});

afterEach(() => {
  console.log('current state after test:', store.getState());
});

describe('testing the reduxStore', () => {

  test('should have null user state as initial state', () => {
    const state = store.getState();
    expect(state.user).toBeNull();
  });

  test('should update user state when addUser is dispatched', () => {
    const user = { id: 3, name: 'kumar' };
    store.dispatch(addUser(user));
    const presentState = store.getState().user;
    expect(presentState).toEqual(user);
  });

  test('should reset user to null when removeUser is dispatched', () => {
    store.dispatch(addUser({ id: 3, name: 'kumar' }));
    store.dispatch(removeUser());
    const state = store.getState().user;
    expect(state).toBeNull();
  });

});
