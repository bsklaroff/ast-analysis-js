var http = require('http');
var url = require('url');
var fs = require('fs');
var acorn = require('acorn');

var mimeMap = {
  'css': 'text/css',
  'js' : 'application/javascript',
};

var staticFiles = [
  'jquery-1.10.2.min.js',
  'jquery-1.10.2.min.map',
  'ace-builds/src-min-noconflict/ace.js',
  'ace-builds/src-min-noconflict/theme-monokai.js',
  'ace-builds/src-min-noconflict/mode-javascript.js',
  'ace-builds/src-min-noconflict/worker-javascript.js',
  'feedback.js',
  'style.css'
];

var getContentType = function(urlPath) {
  var ext = urlPath.split('.').pop();
  return mimeMap[ext] || 'application/octet-stream';
};

var getFeedback = function(reqObj) {
  return acorn.parse(reqObj.code);
}

var s = http.Server(function (req, res) {
  var urlParts, urlPath, body;
  if (req.method == "GET") {
    urlParts = url.parse(req.url, true);
    urlPath = urlParts.pathname;
    if (urlPath === '/feedback') {
      if (urlParts.query.code !== undefined) {
        body = new Buffer(JSON.stringify(getFeedback(urlParts.query)));
        res.writeHead(200, {'Content-Type': 'application/json',
                      'Content-Length': body.length});
        res.end(body);
      } else {
        res.writeHead(400);
        res.end("Error 400 - Missing query parameter 'code'");
      }
    } else if (urlPath === '/') {
      fs.readFile('static/index.html', function(err, body) {
        if (err) {
          console.log('Error loading index.html');
          res.writeHead(500);
          res.end('Error 500 - Internal server error');
        } else {
          res.writeHead(200, {'Content-Type': 'text/html',
                        'Content-Length': body.length});
          res.end(body);
        }
      });
    } else if (urlPath.slice(0, 8) === '/static/') {
      if (staticFiles.indexOf(urlPath.slice(8)) !== -1) {
        fs.readFile(urlPath.slice(1), function(err, body) {
          if (err) {
            console.log('File missing: ' + urlPath);
            res.writeHead(404);
            res.end('Error 404 - File not found');
          } else {
            res.writeHead(200, {'Content-Type': getContentType(urlPath),
                          'Content-Length': body.length});
                          res.end(body);
          }
        });
      } else {
        res.writeHead(404);
        res.end('Error 404 - File not found');
      }
    } else {
      res.writeHead(301, {'Location': '/'});
      res.end();
    }
  } else {
    res.writeHead(405);
    res.end("Error 405 - Method not supported");
  }
});
s.listen(1337);
console.log('Server running at http://127.0.0.1:1337/');
