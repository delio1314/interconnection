function Client(socketId, uuid, name) {
    this.socketId = socketId;
    this.uuid = uuid;
    this.name = name;

}

var socket = null;
var onlineStatus = false;

function init(uuid, callback) {
    socket = io.connect(configuration.serverAddr + "/connect");
    socket.on('connect', function() {
        var socketId = socket.socket.sessionid;
        if (onlineStatus == false) {
            socket.emit('init', uuid, function(reply) {
                // console.log(reply);
                if (reply == "success") {
                    callback(null, new Client(socketId, uuid, name));
                    onlineStatus = true;
                } else {
                    callback(reply);
                    socket.close();
                }
            });
        }
    });
}

Client.prototype.publish = function(channelSpace, channelName, msg, tag, type, callback) {
    var message = new Message(channelSpace, channelName, msg, tag, type);
    console.log(message);
    /* 此处缺省加密传输 */
    socket.emit("publish", JSON.stringify(message), callback);
}

Client.prototype.subscribe = function(channelSpace, channelName, callback) {
    // console.log(channelSpace);
    // console.log(channelName);
    var channel = new Channel(channelSpace, channelName);
    // console.log(channel);
    /* 此处缺省加密传输 */
    socket.emit("subscribe", JSON.stringify(channel), callback);
}

Client.prototype.unsubscribe = function(channelSpace, channelName, callback) {
    var channel = new Channel(channelSpace, channelName);
    /* 此处缺省加密传输 */
    socket.emit("unsubscribe", JSON.stringify(channel), callback);
}

Client.prototype.where_now = function(callback) {
    /* 此处缺省加密传输 */
    socket.emit("where_now", "", callback);
}

Client.prototype.here_now = function(namespace, channel, callback) {

}

Client.prototype.history = function(namespace, channel, callback) {

}

Client.prototype.time = function(callback) {

}

Client.prototype.onMessage = function(callback) {
    socket.on("message", function(data) {
        console.log("onMessage:" + data);
        callback(JSON.parse(data));
    });
}

function Message(channelSpace, channelName, msg, tag, type) {
    this.channelSpace = channelSpace;
    this.channelName = channelName;
    this.msg = msg;
    this.tag = tag;
    this.type = type;
}

function Channel(channelSpace, channelName) {
    this.channelSpace = channelSpace;
    this.channelName = channelName;
}
