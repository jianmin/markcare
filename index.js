/*
 * @(#)index.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/25
 * Description: Defines middlewares and routes 
 * for the MarkCare application.
 */

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');
var cors = require('cors');

// The body-parser module only handles JSON and urlencoded form 
// submissions, not multipart. For multipart, we use multer. 
var multer  = require('multer');

var app = express();
var router = express.Router();

var marklogic = require('marklogic');
var dbconfig = require('./config/connection.js');
//var sem = require("/marklogic/semantics.xqy");

var root_directory = __dirname;

// i18n config
i18n.configure({
  locales: ['en'],
  cookie: 'markcare',
  directory: root_directory + '/locales',

  // whether to write new locale information to disk - defaults to true
  updateFiles: false,

  // setting extension of json files - defaults to '.json' 
  extension: '.json'
});

// Use cookie in Express
app.use(cookieParser());
app.use(i18n.init);

app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.use(multer({dest: './uploads/'}));

// Setup session store with the given options.
// Session data is not saved in the cookie itself, 
// just the session ID.
app.use(session({
  // cookie name. (default: 'connect.sid')
  name: 'markcaresid',
  // session cookie is signed with this secret to prevent tampering.
  secret: 'markcare-secret',
  resave: false,
  saveUninitialized: true
}));

// Load the translation module
var translation = require('./routes/translation.js');
translation.init(router);

// Load the registry module
var registry = require('./routes/registry.js');
registry.init(router, root_directory, dbconfig);

// Load the patient module
var patient = require('./routes/patient.js');
patient.init(router, root_directory, marklogic, dbconfig);

// Load the Blue Button Connector module
var bbc = require('./routes/bbc.js');
bbc.init(router, root_directory, marklogic, dbconfig);

// Load the version module
require('./routes/version.js')(router);

app.use(cors());
app.use('/public', express.static(root_directory + '/public'));
app.use('/api', router);

var port = 9123;
app.listen(port);

console.log('Server started at the port ' + port);
