var Firebase = require('firebase');
var FF = require('../../firebaseFactories');
var Q = require('q');
var crypto = require('crypto');
var errors = require('./errors.json');

var methods = function(rootUrl, secret) {

	// helper methods
	function md4Hash(value) {
		if (typeof value === 'string') {
			return crypto.createHash('md5').update(value).digest("hex");
		}
		return null;
	}

	// Refs
	var subDomainsRef = new Firebase(rootUrl + 'subDomains');

	// -- DOES EXIST FUNCTIONS
	var doesSubDomainExist = FF.doesExistFactory(subDomainsRef, '*');

	// -- GET VALUE AT LOCATION FUNCTION

	// -- PUSH FUNCTIONS
	var pushObjectToSubDomains = FF.pushValueToLocationFactory(subDomainsRef);

	// -- WRITE FUNCTIONS
	var addSubdomainToSubDomains = FF.writeValueToLocationFactory(subDomainsRef, '*');
	var writeReferenceToSubDomain = FF.writeValueToLocationFactory(subDomainsRef, '*/*/*');

	// FUNCTIONS THAT REMOVE DATA

	// PUBLIC:  methods that get exported
	var publicMethods = {

		// managing subDomains
		'addSubDomain': function(subDomainName) {

			var subDomainHash = md4Hash(subDomainName);

			var subDomainData = {
				'name': (subDomainName) ? (subDomainName) : (''),
				'id': subDomainHash,
				'created': Firebase.ServerValue.TIMESTAMP
			};
			var id_subDomain = null;

			return doesSubDomainExist(subDomainHash)
				.then(function(exists) {
					if(exists){
						throw errors[18];
					}else{
						return addSubdomainToSubDomains(subDomainData, subDomainHash);
					}
				})
				.then(function(id) {
					return {'id_subDomain': subDomainHash};
				});
				
		},

		'writeReferenceToSubDomain': function(id_subDomain, referenceName, id_reference) {
			return doesSubDomainExist(id_subDomain)
				.then(function(exists) {
					if(exists){
						return writeReferenceToSubDomain(true, id_subDomain, referenceName, id_reference);
					}else{
						throw errors[19];
					}
				});
		},
		'doesSubDomainExist': function(subDomainName) {
			return doesSubDomainExist(md4Hash(subDomainName));
		}
	};

	return publicMethods;

};

module.exports = methods;