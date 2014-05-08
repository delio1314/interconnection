var redis = require("redis"),
    client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });
// var test = require("./lib/client.js");/
// var test = require("./models/user.js")

// var user = new Object();
// user.uuid = "12345";
// user.name = "dinglei";
// user.secret_key = "abcd";
// test.save(user, function(err){
//     console.log(err);
// });
// test.removeByUuid("12345", function(err, obj){
//     console.log(obj);
// });


// client.on("error", function(err) {
//     console.log("Error " + err);
// });

// client.set("string key", "string val", redis.print);
client.get("name", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 1", "some other value"], redis.print);
// client.set
// test.addMessage("1", "2", "12", {
//     a: "a",
//     b: "b"
// }, new Date(), true, function(reply1) {
//     console.log(reply1);
//     if (reply1 == "success") {
//         test.addMessage("1", "2", "12", {
//             c: "c",
//             d: "d"
//         }, new Date(), true, function(reply2) {
//             if (reply2 == "success") {
//                 test.getMessage("1", "2", "12", 0, 2, function(reply) {
//                     console.log(reply)
//                 });
//             }
//         });
//     }
// });


// client.hgetall("hash key", function(err, replies) {
//     console.log(replies.length + " replies:");
//     console.log(replies);
//     // replies.forEach(function(reply, i) {
//     //     console.log("    " + i + ": " + reply);
//     // });
//     client.quit();
// });
