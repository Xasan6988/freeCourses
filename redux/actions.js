const {FETCH_COURSES, FETCH_USERS, ADD_USER, CLEAR_VISITS, ADD_VISITS} = require('./types');

const User = require('../models/User');
const Course = require('../models/Course');

const fetchUsers = () => {
  return async (dispatch) => {
    try {
      const users = await User.find();

      const arrOfUsers = users.map(user => user.userId);

      dispatch({type: FETCH_USERS, payload: arrOfUsers});
    } catch (e) {
      console.log(`При попытке получить всех юзеров произошла ошибка ${e.message}`);
    }
  };
};

const fetchCourse = () => {
  return async (dispatch) => {
    try {
      const courses = await Course.find();

      dispatch({type: FETCH_COURSES, payload: courses});
    } catch (e) {
      console.log(`При попытке получить курсы произошла ошибка ${e.message}`);
    }
  };
};

const addUser = (userId) => {
  return async (dispatch) => {
    try {
      const user = await new User({userId});
      await user.save();

      dispatch({type: ADD_USER, payload: user.userId});
    } catch (e) {
      console.log(`При попытке добавить юзера в БД произошла ошибка ${e.message}`);
    }
  };
};

const clearVisits = () => {
  return {type: CLEAR_VISITS};
};

const addVisits = (id) => {
  return {type: ADD_VISITS, payload: id};
};

module.exports = {
  fetchCourse, fetchUsers, addUser, clearVisits, addVisits
};
