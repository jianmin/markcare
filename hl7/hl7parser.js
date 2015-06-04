/*
 * @(#)hl7parser.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/29
 * Description: The Hl7 parser module
 */

'use strict';

var utils = require('./utils.js');
var hl7 = require("hl7");

function demographics(pid) {
  var dm = {};

  dm.name = {};
  dm.name.last = pid["Patient Name"][0][0];
  dm.name.first = pid["Patient Name"][0][1];
  if (pid["Patient Name"][0][2]) {
    dm.name.middle = [pid["Patient Name"][0][2]];
  }

  dm.dob = {
    "point": {
      "date": utils.hl7ToISO(pid["Date/Time of Birth"][0][0]),
      "precision": utils.hl7ToPrecision(pid["Date/Time of Birth"][0][0])
    }
  };

  if (pid["SSN Number – Patient"]) {
    dm.identifiers = [];
    dm.identifiers.push({
      "identifier": "2.16.840.1.113883.4.1",
      "extension": pid["SSN Number – Patient"][0][0]
    });
  }

  dm.gender = pid["Sex"][0][0];
  if (dm.gender === 'F') {
    dm.gender = "Female";
  } else if (dm.gender === 'M') {
    dm.gender = "Male";
  } else if (dm.gender === 'U') {
    dm.gender = "Unknown";
  }

  dm.address = {
    "street": pid["Patient Address"][0][0],
    "city": pid["Patient Address"][0][2],
    "state": pid["Patient Address"][0][3]
  };

  dm.name.last = pid["Patient Name"][0][0];
  dm.name.first = pid["Patient Name"][0][1];

  return dm;
}

function results_panel(obr) {
  var r = {};

  r.name = obr["Universal Service ID"][0][1];

  return r;
}

function results_observation(obx) {
  // new observation
  var obs = {};

  obs.result = {};
  obs.result.name = obx["Observation Identifier"][0][1];

  obs.type = obx["Value Type"][0][0];

  obs.status = "completed"; 

  obs.value = obx["Observation Value"][0][0];
  // Units can be coded entry(CE)
  if (obx["Units"][0].length === 1) {
    obs.unit = obx["Units"][0][0];
  } else {
    obs.unit = obx["Units"][0][1];
  }

  obs.date_time = {};
  obs.date_time.point = {
    "date": utils.hl7ToISO(obx["Date/Time of the Observation"][0][0]),
    "precision": utils.hl7ToPrecision(obx["Date/Time of the Observation"][0][0])
  };

  // Encapsulated data
  if (obx["Value Type"][0][0] === 'ED') {
    obs.value = 'Embedded base64-encoded data';
    obs.attachment = {};
    obs.attachment.type = obx["Observation Value"][0][1];
    obs.attachment.subtype = obx["Observation Value"][0][2];
    obs.attachment.encoding = obx["Observation Value"][0][3];
    obs.attachment.data = obx["Observation Value"][0][4];
  }

  return obs;
}

// Takes HL7 data as string and translates it to Blue Button JSON
function translate(data) {
  var bb = {};
  var msg = hl7.translate(hl7.parseString(data));

  // Process message by segment
  for (var seg in msg) {
    var segment = msg[seg];

    if (segment && segment["Segment"] === "PID") {
      bb["demographics"] = demographics(segment);
    } else if (segment && segment["Segment"] === "OBR") {
      // Observation Request
      if (!bb["results"]) {
        bb["results"] = [];
      }
      bb["results"].push({
        "result_set": results_panel(segment)
      });
    } else if (segment && segment["Segment"] === "OBX") {
      // Observation/Result
      var curr = bb["results"].length - 1;
      if (!bb["results"][curr].results) {
        bb["results"][curr].results = [];
      }
      bb["results"][curr].results.push(results_observation(segment));
    }
  }

  return bb;
}

exports.translate = translate;
