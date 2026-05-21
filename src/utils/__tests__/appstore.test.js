import store from '../appStore';
import { addUser, removeUser } from '../userSlice';

describe('testing the reduxStore',()=>{

    test('before all',()=>{
        console.log('connecting before all test cases')
    })

    test('after all',()=>{
        console.log('....after all tests closed....')
    })

    test('testing before connecting',()=>{
        const state=store.getState()
        expect(state.user).toBeNull()
    })

    test('adding user through store',()=>{
        const user={id:3,name:"kumar"}
        const state=store.dispatch(addUser(user))
        const presentState=store.getState().user
        expect(presentState).toEqual(user)
    })

    test('remove user',()=>{
        store.dispatch(removeUser())
        const state=store.getState().user
        expect(state).toBeNull()
    })
})