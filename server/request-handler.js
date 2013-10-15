/* You should implement your request handler function in this file.
 * But you need to pass the function to http.createServer() in
 * basic-server.js.  So you must figure out how to export the function
 * from this file and include it in basic-server.js. Check out the
 * node module documentation at http://nodejs.org/api/modules.html. */

var querystring = require('querystring');
var utils = require('util');

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var log = [];

exports.handleRequest = function(request, response) {

  var headers = defaultCorsHeaders;

  var routes = {
    '/': function(req){
      console.log('INDEX REQUESTED');
      headers['Content-Type'] = "text/plain";
      response.writeHead("200", headers);
      response.end("Hello, World!");
      // return response;// do something
    },
    '/classes/messages': function(req, room){
      // TO DO: include createdAt, updatedAt, roomname and objectId
      console.log('MESSAGES REQUESTED');
      var fullBody = '';

          if(req.method === 'POST'){

            req.on('data', function(chunk) {
              fullBody += chunk.toString();
              // fullBody is a string representing an object structure '{"key":"val"}'
            });

            req.on('end', function() {
              if(!fullBody){
                response.writeHead(404, headers);
                response.end();

              } else {
                var decodedBody = JSON.parse(fullBody);

                if(decodedBody.username && decodedBody.message) {
                  log.push({username: decodedBody.username, message: decodedBody.message});
                  response.writeHead(201, headers);
                  response.end();

                } else {
                  response.writeHead(400, headers);
                  response.end();
                }
              }
            });

          } else if(req.method === 'GET') {
            response.writeHead(200);
            response.end(JSON.stringify(log.slice(0)));

          } else  {
            routes['/405-Method-Not-Supported']();
          }
    },
    '/404-Not-Found': function(req){
      console.log('404 ERROR');
      headers['Content-Type'] = "text/plain";
      response.writeHead(404, headers);
      response.end("404 Not Found!");
    },
    '/405-Method-Not-Supported': function(req){
      headers['Content-Type'] = "text/plain";
      response.writeHead(405, headers);
      response.end("405 - Method Not Supported!");
    }

  };
  if(routes[request.url]){
    routes[request.url](request);
  } else if (request.url.indexOf("classes/") > -1) {
      routes['/classes/messages'](request, request.url.slice(request.url.indexOf("classes/") + 8));
  }

  else {
    routes['/404-Not-Found'](request);
  }
};