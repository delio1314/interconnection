var crypto = require('crypto');
// var client = require('../lib/client');

module.exports = function(app) {
    app.get('/', function(req, res) {
    	var ciphers = crypto.getCiphers();
    	var hashes = crypto.getHashes();
      
  		// console.log(ciphers);
  		// console.log(hashes);
  		// var sha1 = crypto.createHash('sha1');
  		// sha1.update('foobar');
  		// console.log('encriped: ' + sha1.digest('hex'));
      res.sendfile('./views/index.html');
    });
    app.post('/initClient', function(req, res){
        var obj = new Object();
        obj.socketId = req.body.socketId;
        obj.uuid = req.body.uuid;
        obj.name = req.body.name;
        // obj.namespace = req.body.namespace;
        // console.log("body:"+req.body);
        // console.log("query:"+req.query);
        // console.log("params:"+req.params);
        client.addClient(obj);
        res.send('success');
    });
}
