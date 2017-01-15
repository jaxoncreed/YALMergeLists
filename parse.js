var Promise = require('bluebird');
var toCsv = require('to-csv');
var csvToJson = require('csvtojson');
var fs = require('fs');

var orgSyncData = [];
var getOrgSync = new Promise(function(resolve, reject) {
  csvToJson()
  .fromFile('./data/OrgSync.csv')
  .on('json', function(jsonObj) {
      orgSyncData.push(jsonObj);
  })
  .on('done', function(error) {
    if (error) {
      reject(error);
    }
    resolve();
  })
})

var yalData = [];
var getYal = new Promise(function(resolve, reject) {
  csvToJson()
  .fromFile('./data/YAL.csv')
  .on('json', function(jsonObj) {
    yalData.push(jsonObj);
  })
  .on('done', function(error) {
    if (error) {
      reject(error);
    }
    resolve();
  })
})

Promise.all([getOrgSync, getYal]).then(function() {
  var nameHash = {};
  orgSyncData.forEach(function(person) {
    var key = person['First Name'] + person['Last Name'];
    if (!nameHash[key]) nameHash[key] = {};
    nameHash[key].orgSync = person;
  });
  yalData.forEach(function(person) {
    var key = person['First name'] + person['Last name'];
    if (!nameHash[key]) nameHash[key] = {};
    nameHash[key].yal = person;
  });
  var result = Object.keys(nameHash).map(function(key) {
    var yal = nameHash[key].yal || {};
    var orgSync = nameHash[key].orgSync || {};
    return {
      firstName: yal['First name'] || orgSync['First Name'],
      lastName: yal['Last name'] || orgSync['Last Name'],
      orgSyncTitle: orgSync['Title'],
      orgSyncEmail: orgSync['Email Address'],
      orgSyncPhone: orgSync['Phone'],
      yalEmail: yal['Email'],
      yalPhone: yal['Phone'],
      yalGradYear: yal['Grad year'],
      onOrgSyncList: !!nameHash[key].orgSync,
      onYalList: !!nameHash[key].yal,
      onAllLists: !!(nameHash[key].orgSync && nameHash[key].yal)
    }
  });
  fs.writeFile("./output/list.csv", toCsv(result), { flag: 'wx' }, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });

})
