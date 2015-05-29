/*
 * @(#)patient.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/25
 * Description: The patient module
 */

var async = require('async');

var fs = require('fs');
var path = require('path');
                           
// Like mkdir -p, but in node.js!
var mkdirp = require('mkdirp');

// rm -rf for node
var rmdir = require('rimraf');

var Util = require('../util/utils.js');

// Will move this to the config fle.
var MARKLOGIC_HOME = 'C:/marklogic/home';

function getPatientHome(ssn) {
  return MARKLOGIC_HOME + '/patients/' + ssn;
}

// Retrieves a patient by ssn
function selectPatient(req, res, data, callback, marklogic, dbconfig) {
  var ssn = req.params.ssn;

  if (ssn) {
    var db = marklogic.createDatabaseClient(dbconfig.server);
    var qb = marklogic.queryBuilder;

    db.documents.query(
      qb.where(qb.byExample({ssn: ssn}))
    ).result(function(documents) {
      if (documents.length === 1) {
        var document = documents[0];
        var patient = {};

        // Returns all fields in the content.
        patient.ssn = document.content.ssn;
        patient.first_name = document.content.first_name;
        patient.last_name = document.content.last_name;
        patient.gender = document.content.gender;
        patient.age = document.content.age;
        patient.dob = document.content.dob;
        patient.address = document.content.address;

        data.patient = patient;
        callback(null, data);
      } else {
        callback(new Error(res.__('patient_not_found')));
      }
    }, function(error) {
      callback(new Error(JSON.stringify(error)));
    });
  } else {
    callback(new Error('SSN is missing'));
  }
}

// Adds a new patient
function addPatient(req, res, callback, marklogic, dbconfig) {
  var ssn = req.body.ssn;
  var first_names = req.body.first_name;
  var last_name = req.body.last_name;
  var gender = req.body.gender;
  var age = req.body.age;
  var dob = req.body.dob;
  var address = req.body.address;
  var uri = '/patient/' + ssn + '.json';

  var patient = [
    { uri: uri,
      content: {
        ssn: ssn,
        first_name: first_names,
        last_name: last_name,
        gender: gender,
        age: age,
        dob: dob,
        address: address
      }
    }
  ];

  var db = marklogic.createDatabaseClient(dbconfig.server);

  db.documents.write(patient).result( 
    function(response) {
      // Create a home directory for this patient.
      var path = getPatientHome(ssn);
      mkdirp(path, function(err) {
        callback(null);
      });
    }, function(error) {
      console.log(JSON.stringify(error));
      callback(error);
    }
  );
}

// Updates a patient
function updatePatient(req, res, callback, marklogic, dbconfig) {
  console.log(req.body);
  // TO DO
  callback(null);
}

// Processes search request
function processSearchRequest(params, res, marklogic, dbconfig) {
  console.log("---->processSearchRequest");
  console.log(params);

  var patients = [];
  var criteria = {};

  // The ssn param
  var ssn = params['ssn'];
  if (ssn) {
    criteria.ssn = ssn;
  }

  // The first_name param
  var first_name = params['first_name'];
  if (first_name) {
    criteria.first_name = first_name;
  }

  // The last_name param
  var last_name = params['last_name'];
  if (last_name) {
    criteria.last_name = last_name;
  }

  // The gender param
  var gender = params['gender[]'];
  if (gender) {
    // TO DO
  }

  var db = marklogic.createDatabaseClient(dbconfig.server);
  var qb = marklogic.queryBuilder;

  // Query documents with Query By Example
  db.documents.query(
    qb.where(qb.byExample(criteria))
  ).result(function(documents) {
    documents.forEach( function(document) {
      var patient = {};

      // Returns all fields in the content.
      patient.ssn = document.content.ssn;
      patient.first_name = document.content.first_name;
      patient.last_name = document.content.last_name;
      patient.gender = document.content.gender;
      patient.age = document.content.age;
      patient.dob = document.content.dob;
      patient.address = document.content.address;

      patients.push(patient);
    });

    res.json({
      success: true,
      message: 'OK',
      patients: patients
    });
  }, function(error) {
    console.log(JSON.stringify(error));
    res.json({
      success: false,
      message: 'ERROR',
      patients: patients
    });
  });
}

function getPatientTestResults(req, res, data, callback) {
  var ssn = req.params.ssn;
  var dirPath = getPatientHome(ssn);

  fs.readdir(dirPath, function(err, files) {
    var attachments = [];
    if (!err) {
      files.forEach(function(name) {
        var filePath = path.join(dirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
          attachments.push({name: name, size: stat.size});
        }
      });
    }
    data.attachments = attachments;
    callback(null, data);
  });
}

exports.init = function(router, root_directory, marklogic, dbconfig) {

  // Retrieves a patient by ssn
  router.route('/patient/:ssn').get(function(req, res) {
    var data = {};
    async.waterfall([
      function(callback) {
        selectPatient(req, res, data, callback, marklogic, dbconfig);
      }
    ], function(err, result) {   
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } else {
        res.json({
          success: true,
          message: res.__('OK'),
          patient: result.patient
        });
      }
    });
  });

  // Adds a new patient
  router.route('/patient').post(function(req, res) {
    var asyncTasks = [];

    // We don't actually execute the async action here
    // We add functions containing it to an array of "tasks"
    asyncTasks.push(function(callback) {
      addPatient(req, res, callback, marklogic, dbconfig);
    });

    // Now we have an array of functions doing async tasks
    // Execute all async tasks in the asyncTasks array
    async.waterfall(asyncTasks, function(err, result) {
      // All tasks are done now   
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } else {
        res.json({
          success: true,
          message: res.__('patient_added')
        });
      }
    });
  });

  // Updates a patient
  router.route('/patient').put(function(req, res) {
    var asyncTasks = [];

    asyncTasks.push(function(callback) {
      updatePatient(req, res, callback, marklogic, dbconfig);
    });

    async.waterfall(asyncTasks, function(err, result) {
      // All tasks are done now
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } else {
        res.json({
          success: true,
          message: res.__('patient_updated')
        });
      }
    });
  });

  // Deletes a patient by ssn
  router.route('/patient/:ssn').delete(function(req, res) {
    var ssn = req.params.ssn;
    var uri = '/patient/' + ssn + '.json';
    var db = marklogic.createDatabaseClient(dbconfig.server);

    // Removes a patient document by uri
    db.documents.remove(uri).result(function(response) {
      // remove always returns success
      var path = getPatientHome(ssn);
      rmdir(path, function(err) {
        res.json({
          success: true,
          message: res.__('patient_deleted'),
          patient: ssn
        });
      });
    });
  });

  // Returns all patients
  router.route('/patients').get(function(req, res){
    processSearchRequest(req.body, res, marklogic, dbconfig);
  });

  // Searchs patients
  router.route('/patients').post(function(req, res) {
    processSearchRequest(req.body, res, marklogic, dbconfig);
  });

  // Retrieves test results by ssn
  router.route('/attachments/:ssn').get(function(req, res) {
    var data = {};
    async.waterfall([
      function(callback) {
        selectPatient(req, res, data, callback, marklogic, dbconfig);
      },
      function(data, callback) {
        getPatientTestResults(req, res, data, callback);
      }
    ], function(err, result) {   
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } else {
        var patient = result.patient;
        patient.attachments = result.attachments;
        res.json({
          success: true,
          message: res.__('OK'),
          patient: patient
        });
      }
    });
  });

  // Uploads a file
  router.route('/attachment/upload').post(function(req, res) {
    var ssn = req.body.ssn;
    var name = req.files.data.originalname;
    var size = req.files.data.size;

    // Move the uploaded file to the project's home directory.
    var filePath = getPatientHome(ssn) + '/' + name;
    fs.rename(req.files.data.path, filePath, function(err) {
      res.json({
        success: true,
        message: 'The file has been uploaded.',
        attachment: {
          name: name,
          size: size
        }
      });
    });
  });

  // Deletes a file
  router.route('/attachment/:ssn/:filename').delete(function(req, res) {
    var ssn = req.params.ssn;
    var fileName = req.params.filename;
    var filePath = getPatientHome(ssn) + '/' + fileName;

    fs.unlink(filePath, function(err) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } else {
        res.json({
          success: true,
          message: 'The file has been deleted.',
          attachment: {
            name: fileName
          }
        });
      }
    });
  });

  // Downloads a file
  router.route('/attachment/download/:ssn/:filename').get(function(req, res) {
    var ssn = req.params.ssn;
    var fileName = req.params.filename;
    var filePath = getPatientHome(ssn) + '/' + fileName;

    fs.exists(filePath, function(exists) {
      if (!exists) {
        // 404 missing files
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
        return;
      }

      // Sets the content type
      var contentType = Util.getContentType(fileName);
      var contentDisposition = 'attachment;filename=' + fileName;
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition
      });

      // Streams the file
      fs.createReadStream(filePath, 'utf-8').pipe(res);
    });
  });

  // Retrieves a user by id
  router.route('/user/:id').get(function(req, res) {
    var id = req.params.id;
    // Hard code for test purpose
    var user = {
      user_name: id,
      email: 'jianmin.liu@gmail.com',
      full_name: 'Jianmin Liu',
      company: 'MarkLogic',
    };

    res.json({
      success: true,
      message: res.__('OK'),
      user: user
    });
  });

};
