/*
 * @(#)bbc.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/30
 * Description: The Blue Button Connector module
 */

var async = require('async');
var uuid = require('uuid');
var lineReader = require('line-reader');
var hl7parser = require('../hl7/hl7parser.js');
var utils = require('../util/utils.js');

var HL7_DIRECTORY = '/hl7doc/';

// Searches for all documents containing the specified phrase.
//
// A string query is a plain text search string composed of terms, 
// phrases, and operators that can be easily composed by end users 
// typing into an application search box.
function performSimpleSearch(params, res, marklogic, dbconfig) {
  var q = params['q'];
  var db = marklogic.createDatabaseClient(dbconfig.connection);
  var qb = marklogic.queryBuilder;

  // The search returns an array of document descriptors, 
  // one descriptor per matching document. Each descriptor 
  // includes the document contents.
  //
  // To return a search summary instead of the document contents, 
  // use queryBuilder.withOptions to set categories to 'none'.
  //
  // qb.where(qb.parsedFrom(q)).withOptions({categories:'none'})
  //
  // You can also combine a string query with one or more structured 
  // query builder results. For example, you could further limit the 
  // results to documents that also contain 'java' by adding 
  // qb.parsedFrom('java') to the query list passed to qb.where. 
  // The string query is implicitly AND'd with the other query terms.
  var persons = [];

  db.documents.query(
    qb.where(
      qb.directory(HL7_DIRECTORY), 
      qb.parsedFrom(q)
    ).orderBy('gender')
  ).result(function(documents) {
    //console.log(JSON.stringify(documents, null, 2));
    documents.forEach(function(document) {
      var person = convertContent(document.content);
      persons.push(person);
    });

    res.json({
      success: true,
      message: 'OK',
      persons: persons
    });
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
    res.json({
      success: false,
      message: 'Failed to perform string query'
    });
  });
}

// Make sure the database includes a range index on the facet
function performFacetedSearch(params, res, marklogic, dbconfig) {
  var facet = params['facet'];
  var db = marklogic.createDatabaseClient(dbconfig.connection);
  var qb = marklogic.queryBuilder;

  db.documents.query(
    qb.where(qb.directory(HL7_DIRECTORY))
      .calculate(qb.facet(facet))
      .withOptions({categories: 'none'})
  ).result(function(results) {
    //console.log(JSON.stringify(results, null, 2));
    res.json({
      success: true,
      message: 'OK',
      results: results
    });
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
    res.json({
      success: false,
      message: 'Failed to perform faceted search'
    });
  });
}

function selectManyPersons(params, res, marklogic, dbconfig) {
  var facet = params['facet'];
  var value = params['value'];
  var db = marklogic.createDatabaseClient(dbconfig.connection);
  var qb = marklogic.queryBuilder;
  var persons = [];

  db.documents.query(
    qb.where(
      qb.directory(HL7_DIRECTORY), 
      qb.value(facet, value)
    )
  ).result(function(documents) {
    documents.forEach(function(document) {
      var person = convertContent(document.content);
      persons.push(person);
    });

    res.json({
      success: true,
      message: 'OK',
      persons: persons
    });
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
    res.json({
      success: false,
      message: 'Failed to perform value query'
    });
  });
}

function selectOnePerson(id, data, callback, marklogic, dbconfig) {
  var db = marklogic.createDatabaseClient(dbconfig.connection);
  var qb = marklogic.queryBuilder;

  db.documents.query(qb.where(qb.byExample({id: id}))).result(function(documents) {
    documents.forEach(function(document) {
      if (documents.length === 1) {
        var document = documents[0];
        var person = {};

        person.id = document.content.id;
        person.first_name = document.content.demographics.name.first;
        person.last_name = document.content.demographics.name.last;
        person.dob = document.content.demographics.dob.point.date;
        person.gender = document.content.demographics.gender;
        person.city = document.content.demographics.address.city;
        person.results    = document.content.results;

        data.person = person;
      } else {
        data.person = null;
      }
      callback(null, data);
    });
  }, function(error) {
    console.log(JSON.stringify(error, null, 2));
    callback(new Error(JSON.stringify(error)));
  });
}

function convertContent(content) {
  var person = {};

  person.id = content.id;
  person.first_name = content.demographics.name.first;
  person.last_name = content.demographics.name.last;
  person.dob = content.demographics.dob.point.date;
  person.gender = content.demographics.gender;
  person.city = content.demographics.address.city;
  person.total_results = 0;

  if (content.results) {
    person.total_result_sets = content.results.length;
    content.results.forEach(function(rs) {
      person.total_results += rs.results.length;
    });
  } else {
    person.total_result_sets = 0;
  }

  return person;
}

function insertHL7Message(hl7data, marklogic, dbconfig, res, count) {
  hl7data = hl7data.split('\n').join('\r');

  var hl7message = hl7parser.translate(hl7data);
  var id = uuid.v4();
  var uri = HL7_DIRECTORY + id + '.json';

  hl7message.id = id;

  var hl7doc = [{
    uri: uri,
    content: hl7message
  }];

  var db = marklogic.createDatabaseClient(dbconfig.connection);

  db.documents.write(hl7doc).result( 
    function(response) {
      if (res) {
        var msg = (count > 1) ? (count + ' HL7 messages have been loaded.') : 'One HL7 message has been loaded.';
        res.json({
          success: true,
          message: msg
        });
      }
    }, function(error) {
      console.log(JSON.stringify(error));
    }
  );
}

exports.init = function(router, root_directory, marklogic, dbconfig) {

  router.route('/bbc/simple-search').post(function(req, res) {
    performSimpleSearch(req.body, res, marklogic, dbconfig);
  });

  router.route('/bbc/faceted-search').post(function(req, res) {
    performFacetedSearch(req.body, res, marklogic, dbconfig);
  });

  router.route('/bbc/persons').post(function(req, res) {
    selectManyPersons(req.body, res, marklogic, dbconfig);
  });

  router.route('/bbc/person/:id').get(function(req, res) {
    var id = req.params.id;
    var data = {};

    async.waterfall([
      function(callback) {
        selectOnePerson(id, data, callback, marklogic, dbconfig);
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
          message: 'OK',
          person: result.person
        });
      }
    });
  });

  // Loads HL7 data into the database.
  router.route('/bbc/load-hl7').post(function(req, res) {
    var filename = root_directory + '/hl7/test/data.txt';
    var buf = '';
    var count = 0;

    lineReader.eachLine(filename, function(line) {
      if (line.length > 3) {
        if (line.indexOf('MSH') === 0) {
          count++;
          if (buf) {
            insertHL7Message(buf, marklogic, dbconfig);
          }
          buf = line;
        } else {
          buf += line;
        }
      }
    }).then(function() {
      insertHL7Message(buf, marklogic, dbconfig, res, count);
    });
  });

  // Removes HL7 data from the database.
  router.route('/bbc/remove-hl7').delete(function(req, res) {
    var criteria = {
      directory: HL7_DIRECTORY
    };
    var db = marklogic.createDatabaseClient(dbconfig.connection);

    db.documents.removeAll(criteria).result(
      function(response) {
        res.json({
          success: true,
          message: 'All HL7 documents have been removed.'
        });
      }
    );
  });

};
