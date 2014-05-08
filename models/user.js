// var async = require('async');
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

// 定义一个schema
var UserSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        index: "hash",
        unique: true
    },
    name: {
        type: String,
        required: true,
        index: "hash",
        unique: true
    },
    secret_key: {
        type: String,
        required: true,
        unique: true
    }
}, {
    collections: "users"
});

// 将该schema发布成model  
var UserModel = mongodb.mongoose.model("User", UserSchema);

function User(obj) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.secret_key = obj.secret_key;
}

// 保存实例
exports.save = function(obj, cb) {
    // 用model创建entity
    var instance = new UserModel(obj);
    UserModel.findOne({
        uuid: obj.uuid
    }, function(err, user) {
        if (err) {
            return callback('find error');
        } else if (user) {
            return callback('uuid already exists!');
        } else {
            UserModel.findOne({
                name: obj.name
            }, function(err, user) {
                if (err) {
                    return callback('find error');
                } else if (user) {
                    return callback('name already exists!');
                } else {
                    instance.save(function(err) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(null);
                        }
                    });
                }
            });
        }
    });
}

// 根据uuid删除实例
exports.removeByUuid = function(uuid, callback) {
    UserModel.findOne({
        uuid: obj.uuid
    }, function(err, user) {
        if (err) {
            return callback('find error');
        } else if (user) {
            return callback('uuid already exists');
        } else {
            // 用model删除
            UserModel.findOneAndRemove({
                uuid: uuid
            }, function(err) {
                if (err) {
                    return callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
}



// 根据name删除实例
exports.removeByName = function(name, callback) {
    // 用model删除
    UserModel.findOneAndRemove({
        name: name
    }, function(err) {
        callback(err);
        // if (err) {
        //   return callback(err);
        // }
        // callback(null);
    });
}

// 根据uuid更新name
exports.updateNameByUuid = function(uuid, name, callback) {
    // 用model更新
    UserModel.findOneAndUpdate({
        uuid: uuid
    }, {
        name: name
    }, function(err) {
        callback(err);
    });
}

// 根据uuid查询
exports.findByUuid = function(uuid, callback) {
    // 用model查询
    UserModel.findOne({
        uuid: uuid
    }, function(err, user) {
        callback(err, user);
    });
}

// 根据name查询
exports.findByName = function(name, callback) {
    // 用model查询
    UserModel.findOne({
        name: name
    }, function(err, user) {
        callback(err, user);
    });
}
