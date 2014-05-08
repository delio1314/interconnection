var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/interconnection');
exports.mongoose = mongoose;
