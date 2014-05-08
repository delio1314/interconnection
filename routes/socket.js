var redis = require("redis"),
    offline = require("./../lib/offlineTable.js"),
    recv_redis = redis.createClient();

module.exports = function(socket) {
    socket.of('/connect').on('connection', function(socket) {
        // 为每一个接入进来的client创建一个redis连接
        var redis_client = redis.createClient();
        // 初始化
        socket.on('init', function(uuid, fn) {
            recv_redis.HGETALL(uuid, function(error, reply) {
                console.dir(reply);
                if (reply == null) {
                    redis_client.quit();
                    fn("not exists");
                } else if (reply.onlineStatus == "1") {
                    redis_client.quit();
                    fn("already online");
                } else {
                    // 遍历订阅的通道
                    recv_redis.SMEMBERS(uuid + "channel", function(error, replies) {
                        if (replies.length > 0) {
                            for (var index = 0; index < replies.length; index++) {
                                var channel = replies[index].toString();
                                // console.log(channel);
                                // 从离线集合中删除
                                recv_redis.SREM("offline" + channel, uuid);
                                // 增加到在线集合中
                                recv_redis.SADD("online" + channel, uuid);
                                // 加入房间
                                // socket.join(channel);
                                // 订阅主题
                                // console.log(uuid + " subscribe " + channel);
                                redis_client.subscribe(channel);
                            }
                        }
                    });
                    setTimeout(function() {
                        // 从离线列表中删除
                        if (offline.offlineTable.contains(uuid)) {
                            // 如果在离线列表中存在用户,取出离线消息发送
                            var offlineClient = offline.offlineTable.get(uuid);
                            console.log("online uuid: " + uuid);
                            var size = offlineClient.length();
                            for (var index = 0; index < size; index++) {

                                /* 此处还需加密传输 */
                                var message = offlineClient.shift();
                                socket.emit("message", JSON.stringify(message));
                                console.log("offline message: ", message);
                                /* 传输完成后需要填入数据库 */
                            }
                            offline.offlineTable.remove(uuid);
                        }
                    }, 100);
                    // 更新在线状态
                    recv_redis.HSET(uuid, "onlineStatus", "1");
                    // 将uuid填入socket中
                    socket.set("uuid", uuid);
                    // 返回
                    fn("success");
                }
            });
        });

        // 离线
        socket.on('disconnect', function() {
            socket.get("uuid", function(err, uuid) {
                if (uuid != null) {
                    // console.log(uuid);
                    // 遍历订阅的通道
                    recv_redis.SMEMBERS(uuid + "channel", function(error, replies) {
                        // console.log(replies);
                        if (replies.length > 0) {
                            for (var index = 0; index < replies.length; index++) {
                                var channel = replies[index].toString();
                                // 从在线集合中删除
                                recv_redis.SREM("online" + channel, uuid);
                                // 增加到离线集合中
                                recv_redis.SADD("offline" + channel, uuid);
                                // 退出房间
                                // socket.leave(channel);
                                // 取消订阅
                                redis_client.unsubscribe(channel);
                                redis_client.quit();
                            }
                        }
                    });
                    // 更新在线状态
                    recv_redis.HSET(uuid, "onlineStatus", "0");
                    console.log("hset uuid onlineStatus 0");
                    // 增加到离线列表中
                    var offlineClient = new offline.OfflineClient();
                    offline.offlineTable.add(uuid, offlineClient);
                    // console.log("add to offline list " + uuid);
                    // console.log("uuid " + typeof(uuid));
                    // console.log("get from table " + offline.offlineTable.get(uuid));
                    // console.log("length: "+offline.offlineTable.get(uuid).length());
                }
            });
        });

        socket.on('publish', function(data, fn) {
            socket.get("uuid", function(err, uuid) {
                if (uuid == null || uuid == "undefined") {
                    fn("not online");
                } else {
                    // var str_uuid = uuid.toString();
                    console.log("publish data:" + data);
                    var message = new Message(JSON.parse(data), uuid);
                    // console.log(message);
                    // console.log(message.channelSpace);
                    // console.log(message.channelName);
                    var channel = message.channelSpace + "." + message.channelName;
                    // 向通道上发送消息
                    console.log("publish data on " + channel);
                    recv_redis.publish(channel, JSON.stringify(message));
                    // 离线用户消息缓存
                    recv_redis.SMEMBERS("offline" + channel, function(err, replies) {
                        console.log("offline uuids:" + replies);
                        for (var index = 0; index < replies.length; index++) {
                            var id = replies[index].toString();
                            console.log("contains uuid: " + offline.offlineTable.contains(id));
                            if (offline.offlineTable.contains(id)) {
                                var date = new Date();
                                console.log("push message " + message + " to " + uuid);
                                offline.offlineTable.get(id).push(message);
                            }
                        }
                    });
                    fn("success");
                }
            });
        });

        socket.on('subscribe', function(data, fn) {
            socket.get("uuid", function(err, uuid) {
                if (uuid == null || uuid == "undefined") {
                    fn("not online");
                } else {
                    var objData = JSON.parse(data);
                    var channelSpace = objData.channelSpace;
                    var channelName = objData.channelName;
                    recv_redis.SISMEMBER("channelSpace", channelSpace, function(err, reply) {
                        if (reply == 0) {
                            fn("invalid space");
                        } else {
                            var channel = channelSpace + "." + channelName;
                            // console.log("channel:" + channel);
                            // 用户订阅通道列表添加
                            recv_redis.SADD(uuid + "channel", channel, function(err, reply1) {
                                if (err) {
                                    fn("error");
                                } else if (reply1 == 0) {
                                    fn("already subscribe the channel");
                                } else {
                                    // 通道在线列表添加
                                    recv_redis.SADD("online" + channel, uuid, function(err, reply2) {
                                        if (err) {
                                            fn("error");
                                        } else if (reply2 == 0) {
                                            fn("already in the channel");
                                        } else {
                                            redis_client.subscribe(channel);
                                            fn("success");
                                        }
                                    });
                                }
                            });
                        }
                    });
                    // console.log("subscribe data:" + data);
                }
            })
        });

        socket.on('unsubscribe', function(data, fn) {
            socket.get("uuid", function(err, uuid) {
                if (uuid == null || uuid == "undefined") {
                    fn("not online");
                } else {
                    var objData = JSON.parse(data);
                    var channelSpace = objData.channelSpace;
                    var channelName = objData.channelName;
                    var channel = channelSpace + "." + channelName;
                    console.log("channel:" + channel);
                    // 用户订阅通道列表删除
                    recv_redis.SREM(uuid + "channel", channel, function(err, reply1) {
                        if (err) {
                            fn("error");
                        } else if (reply1 == 0) {
                            fn("already unsubscribe the channel");
                        } else {
                            // 通道在线列表删除
                            recv_redis.SREM("online" + channel, uuid, function(err, reply2) {
                                if (err) {
                                    fn("error");
                                } else if (reply2 == 0) {
                                    fn("already out the channel");
                                } else {
                                    redis_client.unsubscribe(channel);
                                    fn("success");
                                }
                            });
                        }
                    });
                }
            });
        });

        redis_client.on("message", function(channel, message) {
            console.log("redis on:" + message);
            /* 此处还需加密传输 */
            socket.emit("message", message);
            /* 传输完成后需要填入数据库 */
        });

        socket.on('where_now', function(data, fn) {
            socket.get("uuid", function(err, uuid) {
                if (uuid == null || uuid == "undefined") {
                    fn("not online");
                } else {
                    recv_redis.SMEMBERS(uuid + "channel", function(err, replies) {
                        if (err) {
                            fn("error");
                        } else {
                            fn("success", replies);
                        }
                    });
                }
            });
        });

        socket.on('here_now', function(socket) {

        });

        socket.on('history', function(socket) {

        });

        socket.on('time', function(socket) {

        });
    });
}

// 发送消息格式uuid, channelSpace, channelName, msg, date, tag, type

function Message(data, uuid) {
    this.uuid = uuid;
    this.channelSpace = data.channelSpace;
    this.channelName = data.channelName;
    this.msg = data.msg;
    this.date = new Date();
    this.tag = data.tag;
    this.type = data.type;
}
