var redis = require("redis"),
    service_redis = redis.createClient();

// 路由服务层作为一个subscriber订阅服务
service_redis.subscribe("init", "subscribe", "unsubscribe", "publish");
service_redis.psubscribe("init", function(data){
    console.log(data);
});


// 标识一个用户，需要持久化存储
function Client(uuid, name) {
    this.uuid = uuid;
    this.name = name;
}

// 标识用户连接
function Connection(uuid, socketId) {
    this.uuid = uuid;
    this.socketId = socketId;
}

// 标识某个通道上的订阅者，需要持久化存储
function Channel(channelSpace, channelName, subscribers) {
    this.channelSpace = channelSpace;
    this.channelName = channelName;
    this.subscribers = subscribers;
}

// 存储用户在某个通道上的消息，需要持久化存储

function Message(channelSpace, channelName, uuid, message, date, emitted) {
    this.channelSpace = channelSpace;
    this.channelName = channelName;
    this.uuid = uuid;
    this.message = message;
    this.date = date;
    this.emitted = emitted;
}

// 新增用户 hash存储
exports.addClient = function(uuid, name, callback) {
    // 以uuid为key
    var key = uuid;
    client.hset(key, "name", name, function(reply) {
        if (reply == "OK") {
            callback("success");
        } else {
            callback(reply);
        }
    });
}

// 删除用户
exports.delClient = function(uuid, callback) {
    // 以uuid为key
    var key = uuid;
    client.hdel(key, function(reply) {
        if (reply > 0) {
            callback("success");
        } else {
            callback(reply);
        }
    });
}

// 查询用户 
exports.getClient = function(uuid, callback) {
    // 以uuid为key
    var key = uuid;
    client.hget(key, "name", function(reply) {
        if (reply == "nil") {
            callback(null);
        } else {
            callback(new CLient(uuid, reply));
        }
    });
}

// 增加连接 hash存储
exports.addConnecion = function(uuid, socketId, callback) {
    // 以uuid"connection"为key
    var key = uuid + "connection";
    client.hset(key, "socketId", socketId, function(reply) {
        if (reply == "OK") {
            callback("success");
        } else {
            callback(reply);
        }
    });
}

// 删除连接
exports.delConnection = function(uuid, callback) {
    // 以uuid"connection"为key
    var key = uuid + "connection";
    client.hdel(key, function(reply) {
        if (reply > 0) {
            callback("success");
        } else {
            callback(reply);
        }
    });
}

// 查询连接
exports.getConnection = function(uuid, callback) {
    // 以uuid"connection"为key
    var key = uuid + "connection";
    client.hget(key, "socketId", function(reply) {
        if (reply == "nil") {
            callback(null);
        } else {
            callback(new Connection(uuid, reply));
        }
    });
}

// 新增订阅者 set存储
exports.addSubscriber = function(channelSpace, channelName, subscriber, callback) {
    // 以channelSpace+channelName为key
    var key = channelSpace + channelName;
    client.sadd(subscriber, function(reply) {
        if (reply > 0) {
            callback("success");
        } else {
            callback(reply);
        }
    });
}

// 删除订阅者
exports.delSubscriber = function(channelSpace, channelName, unsubscriber, callback) {
    // 以channelSpace+channelName为key
    var key = channelSpace + channelName;
    client.spop(unsubscriber, function(reply) {
        if (reply != "nil") {
            callback("success");
        } else {
            callback(reply);
        }
    });
}

// 查询订阅者
exports.getSubscribers = function(channelSpace, channelName, callback) {
    // 以channelSpace+channelName为key
    var key = channelSpace + channelName;
    client.smembers(key, function(replies) {
        var subscribers = new Array();
        replies.forEach(function(reply, i) {
            subscribers[i] = reply;
        });
        callback(new Channel(channelSpace, channelName, subscribers));
    });
}

// 新增消息 以list存储
exports.addMessage = function(channelSpace, channelName, uuid, message, date, emitted, callback) {
    // 以channelSpace+channelName+uuid+date为key
    var key = channelSpace + channelName + uuid;
    var str_message = JSON.stringify(message);
    client.lpush(key, str_message, function(err, reply) {
        if (reply > 0) {
            callback("success");
        } else {
            callback(err);
        }
    });
}

// 获取消息
exports.getMessage = function(channelSpace, channelName, uuid, start, end, callback) {
    // 以channelSpace+channelName+uuid+date为key
    var key = channelSpace + channelName + uuid;
    client.lrange(key, 0, 200, function(err, reply) {
    	console.log(reply);
        if (reply != "nil") {
            callback(reply);
        } else {
            callback(reply);
        }
    });
}
