const {FETCH_COURSES, FETCH_USERS, ADD_USER, ADD_VISITS, CLEAR_VISITS, DELETE_USER} = require('./types');

const initialState = {
  users: [],
  courses: [],
  dayVisits: []
};

function rootReducer(state = initialState, action) {
  if (action.type === FETCH_COURSES) {
    return {...state, courses: [...action.payload]};
  } else if (action.type === FETCH_USERS) {
    return {...state, users: [...action.payload]};
  } else if (action.type === ADD_USER) {
    return {...state, users: [...state.users, action.payload]};
  } else if (action.type === ADD_VISITS) {
    return {...state, dayVisits: [...state.dayVisits, action.payload]};
  } else if (action.type === CLEAR_VISITS) {
    return {...state, dayVisits: []};
  } else if (action.type === DELETE_USER) {
    return {...state, users: [...state.users.filter(user => user.userId !== action.payload)]};
  }
  return state;
}


module.exports = rootReducer;
