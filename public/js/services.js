/*
 * @(#)services.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

// Patient Service
app.service('PatientService', ['AppConfig', 'PageService', function(AppConfig, PageService) {
  this.getPatients = function() {
    return PageService.get('/api/patients');
  };

  this.get = function(ssn) {
    return PageService.get('/api/patient/' + ssn);
  };

  this.delete = function(ssn) {
    return PageService.delete('/api/patient/' + ssn);
  };

  this.add = function(data) {
    return PageService.post('/api/patient', data);
  };

  this.update = function(data) {
    return PageService.put('/api/patient', data);
  };

  this.search = function(data) {
    return PageService.post('/api/patients', data);
  };

  this.attachments = function(ssn) {
    return PageService.get('/api/attachments/' + ssn);
  };

  this.deleteAttachment = function(ssn, filename) {
    return PageService.delete('/api/attachment/' + ssn + '/' + filename);
  };
}]);

// User Service
app.service('UserService', ['PageService', function(PageService) {
  this.get = function(id) {
    return PageService.get('/api/user/' + id);
  };
}]);

/* end of services.js */
