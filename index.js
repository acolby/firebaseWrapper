var usersAndSessionsManagement = require('./modules/usersAndSessionsManagement/');
var teamsManagement = require('./modules/teamsManagement/');
var subDomainsManagement = require('./modules/subDomainsManagement/');

var firebaseWrapperCreator = function(rootUrl, secret) {
	var returnObject = {};

	addKeysToObjectKeysToObject(usersAndSessionsManagement(rootUrl, secret), returnObject);
	addKeysToObjectKeysToObject(teamsManagement(rootUrl, secret), returnObject);
	addKeysToObjectKeysToObject(subDomainsManagement(rootUrl, secret), returnObject);

	return returnObject;
};

function addKeysToObjectKeysToObject(objWithKeys, obj){
	for (var key in objWithKeys){
		obj[key] = objWithKeys[key];
	}
} 

module.exports = firebaseWrapperCreator;