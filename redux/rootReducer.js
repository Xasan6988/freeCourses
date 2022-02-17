const {FETCH_COURSES, FETCH_USERS, ADD_USER} = require('./types');

const initialState = {
  users: [],
  courses: [],
};

function rootReducer(state = initialState, action) {
  if (action.type === FETCH_COURSES) {
    return {...state, courses: [...action.payload]};
  } else if (action.type === FETCH_USERS) {
    return {...state, users: [...action.payload]};
  } else if (action.type === ADD_USER) {
    return {...state, users: [...state.users, action.payload]};
  }
  return state;
}


module.exports = rootReducer;
