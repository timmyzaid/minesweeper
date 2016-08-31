var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.redirect('/html/index.html');
});

app.use(express.static('static'));

app.listen(8080, function() {
	console.log('Listening on port 8080...');
});