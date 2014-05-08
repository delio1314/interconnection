var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

// 定义一个schema
var CallLogSchema = new Schema({
  phoneId: String,
  sid: Number,
  phone: String,
  person: Number,
  c_type: Number,
  date: { type: Date, default: Date.now }, 
  duration: Number
}, {
  collections: 'calllog'
});

// 将该schema发布成model  
var CallLogModel = mongodb.mongoose.model("CallLog", CallLogSchema);

function CallLog(callLog) {
  this.phoneId = callLog.phoneId;
  this.sid = callLog.sid;
  this.phone = callLog.phone;
  this.person = callLog.person;
  this.c_type = callLog.c_type;
  this.date = callLog.date;
  this.duration = callLog.duration;
}; 

// 保存实例
exports.save = function(obj, callback) {
  var instance = new CallLogModel(obj);
  CallLogModel.findOne({phoneId: obj.phoneId, sid: obj.sid}, function (err, doc) {
    if (err) {
      return callback(err);
    }
    if (doc) {
      return callback('instance already exists!');
    }
    // 用model创建entity
    instance.save(function(err, doc) {
      if (err) {
        return callback(err);
      }
      callback(null, doc);
    });
  });
};

// 根据Id删除
exports.removeById = function(id, callback) {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // 用model删除
    CallLogModel.findByIdAndRemove(id, function(err, doc) {
      if (err) {
        return callback(err);
      }
      if (!doc) {
        return callback('instance not found!');
      }
      callback(null, doc);
    });
  } else {
    return callback('invalid _id');
  }
}

// 根据phoneId删除，无返回
exports.removeByPhoneId = function(phoneId, callback) {
  // 用model删除
  CallLogModel.remove({phoneId: phoneId}, function(err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

// 根据phoneId及sid删除
exports.removeByPhoneIdSid = function(phoneId, sid, callback) {
  // 用model删除
  CallLogModel.findOneAndRemove({phoneId: phoneId, sid: sid}, function(err, doc) {
    if (err) {
      return callback(err);
    }
    if (!doc) {
      return callback('instance not found!');
    }
    callback(null, doc);
  });
}

// 根据Id查询实例
exports.findById = function(id, callback) {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // 用model查询
    CallLogModel.findById(id, function (err, doc) {
      if (err) {
        return callback(err);
      }
      if (!doc) {
        return callback('instance not found!');
      }
      callback(null, doc);
    });
  } else {
    return callback('invalid _id');
  }
}

// 根据phoneId查询
exports.findByPhoneId = function(phoneId, callback) {
   // 用model查询
  CallLogModel.find({phoneId: phoneId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length == 0) {
      return callback('instance not found!');
    }
    callback(null, docs);
  });
}

// 根据phoneId及sid查询
exports.findByPhoneIdSid = function(phoneId, sid, callback) {
   // 用model查询
  CallLogModel.findOne({phoneId: phoneId, sid: sid}, function (err, doc) {
    if (err) {
      return callback(err);
    }
    if (!doc) {
      return callback('instance not found!');
    }
    callback(null, doc);
  });
}
