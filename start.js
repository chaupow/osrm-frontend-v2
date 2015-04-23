#!/usr/bin/env node
 
var connect = require('/usr/local/lib/node_modules/connect');
var serveStatic = require('/usr/local/lib/node_modules/serve-static');
var port = process.argv.length > 2 && process.argv[2] || 8337;
connect().use(serveStatic('.')).listen(port);