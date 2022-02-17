const {Schema, model} = require('mongoose');

const schema = new Schema({
  title: {type: String, required: true},
  url: {type: String, required: true, unique: true},
  category: {type: String},
  description: {type: String},
  comment: {type: String}

});

module.exports = model('Course', schema)
