module.exports = {
  checkUser(id, users, addUser) {
    if (users.indexOf(id) === -1) {
      return true;
    } else {
      return false
    }
  }
}
