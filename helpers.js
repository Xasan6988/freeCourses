module.exports = {
  checkUserInArr(id, users) {
    if (users.indexOf(id) === -1) {
      return false;
    } else {
      return true;
    }
  },
  findItemInArr(id, arr) {
    return arr.find(item => item._id.toString() === id);
  },
  arrToLower(arr) {
    return arr.map(item => item.toLowerCase());
  }
}
