const {Schema, model} = require('mongoose');

const schema = new Schema({
  userId: {type: Number, require: true, unique: true}
});

module.exports = model('User', schema);
