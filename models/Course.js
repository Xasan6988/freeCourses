const {Schema, model} = require('mongoose');

const schema = new Schema({
  name: {type: String, required: true},
  url: {type: String, required: true, unique: true},
  category: {type: String}
});

module.exports = model('Course', schema)
