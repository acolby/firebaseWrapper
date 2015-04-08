var Firebase = require('firebase');
var FF = require('../../firebaseFactories');
var FirebaseTokenGenerator = require("firebase-token-generator");
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

	function generateFirebaseLoginToken(userData){
		var tokenData = {
			'uid': userData.id,
			'id': userData.id,
			'email': userData.email
		};
		var tokenGenerator = new FirebaseTokenGenerator(secret);
		var token = tokenGenerator.createToken(tokenData);
		return token;
	}

	// Refs
	var usersRef = new Firebase(rootUrl + 'users');
	var emailsRef = new Firebase(rootUrl + 'emails');
	var sessionsRef = new Firebase(rootUrl + 'sessions');
	var subDomainsRef = new Firebase(rootUrl + 'subDomains');

	// -- DOES EXIST FUNCTIONS
	var doesEmailHashExist = FF.doesExistFactory(emailsRef, '*');
	var doesSessionTokenExistFromUserId = FF.doesExistFactory(usersRef, '*/ids_sessions/*');
	var doesUserExist = FF.doesExistFactory(usersRef, '*');

	// -- GET VALUE AT LOCATION FUNCTION
	var getUserFromUserId = FF.getValueAtLocationFactory(usersRef, '*', errors[6]);
	var getEmailFromEmailAddressHash = FF.getValueAtLocationFactory(emailsRef, '*', errors[6]);
	var getSessionTokenFromTokenStringHash = FF.getValueAtLocationFactory(sessionsRef, '*', errors[16]);

	function getUserFromEmailAddress(email) {
		return getEmailFromEmailAddressHash(md4Hash(email))
			.then(function(emailObj) {
				return getUserFromUserId(emailObj.id_user);
			});
	}

	// FUNCTIONS THAT WRITE DATA

	// -- PUSH FUNCTIONS
	var pushUserToUsers = FF.pushValueToLocationFactory(usersRef);

	// -- WRITE FUNCTIONS
	var writeDataToUser = FF.writeValueToLocationFactory(usersRef, '*');
	var writeSessionDataToUser = FF.writeValueToLocationFactory(usersRef, '*/ids_sessions/*');
	var writeDataToEmails = FF.writeValueToLocationFactory(emailsRef, '*');
	var writeDataToSessions = FF.writeValueToLocationFactory(sessionsRef, '*');
	var writeReferenceToUser = FF.writeValueToLocationFactory(usersRef, '*/*/*');

	// FUNCTIONS THAT REMOVE DATA

	// -- REMOVE FUNCTIONS
	var removeSessionFromUser = FF.removeValueAtLocationFactory(usersRef, '*/ids_sessions/*');

	// PUBLIC:  methods that get exported
	var publicMethods = {
		// managing users and accounts
		'addEmail': function(email) {

			var emailHash = md4Hash(email);

			var userObject = {};
			var emailObject = {};

			// make sure the email doesn't exist
			return doesEmailHashExist(emailHash)
				.then(function(exists){
					if(exists){
						throw errors[0];
					}else{
						userObject = {
							'email': email,
							'id_email': emailHash,
							'activated': false,
							'dateAdded': Firebase.ServerValue.TIMESTAMP,
							'createAccountToken': {
								'value': md4Hash(this.id + email),
								'dateAdded': Firebase.ServerValue.TIMESTAMP
							}
						};
						return pushUserToUsers(userObject);
					}
				})
				.then(function(userid){
					var emailObject = {
						'email': email,
						'id_user': userid,
						'id': emailHash
					};
					return writeDataToEmails(emailObject, emailHash);
				});
		},
		'getUserFromUserId': function(id) {

			return getUserFromUserId(id);
		},
		'getUserFromEmailAddress': function(email) {

			return getUserFromEmailAddress(email);
		},
		'changePassword': function(email, oldPassword, newPassword) {
			var updatedInfo = {
				'password': md4Hash(newPassword)
			};
			return getUserFromEmailAddress(email)
				.then(function(userData) {
					if (userData.activated === false) {
						throw errors[12];
					} else if(userData.password !== md4Hash(oldPassword)){
						throw errors[7];
					}else{
						return writeDataToUser(updatedInfo, userData.id);
					}
				});
		},
		'activateAccount': function(email, password, username, token) {
			var passwordHash = md4Hash(password);

			var userData = {};

			var updatedInfo = {
				'activated': true,
				'password': passwordHash,
				'username': username
			};

			return getUserFromEmailAddress(email)
				.then(function(value) {
					if (value.activated === true) {
						throw errors[5];
					} else if (value.createAccountToken.value !== token){
						throw errors[4];
					} else {
						userData = value;
						return writeDataToUser(updatedInfo, userData.id);
					}
				});
		},
		'getFirebaseLoginToken': function(email, password){

			var token = null;
			var userData = {};
			return getUserFromEmailAddress(email)
				.then(function(val) {
					userData = val;
					if (userData.activated === false) {
						throw errors[12];
					} else if(userData.password !== md4Hash(password)){
						throw errors[15];
					}else{
						return generateFirebaseLoginToken(userData);
					}
				})
				.then(function(val){
					// add token hash to user's sessions
					token = val;
					var tokenHash = md4Hash(token);
					return writeSessionDataToUser(true, userData.id, tokenHash);
				})
				.then(function(){
					var tokenHash = md4Hash(token);
					var session = {
						'id': tokenHash,
						'id_user': userData.id,
						'created': Firebase.ServerValue.TIMESTAMP,
						'valid': true
					};
					return writeDataToSessions(session, tokenHash);
				})
				.then(function(){
					return token;
				});
		},
		'removeFirebaseLoginToken': function(uid, token){

			var tokenHash = md4Hash(token);
			var userData = null;
			// check if it exists if it does 
			return getUserFromUserId(uid)
			.then(function(val){
				userData = val;
				return doesSessionTokenExistFromUserId(userData.id, tokenHash);
			})
			.then(function(exists){
				if(exists){
					var data = {
						'valid': false,
						'devalidated': Firebase.ServerValue.TIMESTAMP
					};
					return writeDataToSessions(data, tokenHash);
				}else{
					throw errors[16];
				}
			})
			.then(function(){
				return removeSessionFromUser(userData.id, tokenHash);
			});
		},
		'getSessionToken': function(uid, token){
			var tokenHash = md4Hash(token);
			var userData = null;
			// check if it exists if it does 
			return getUserFromUserId(uid)
			.then(function(val){
				userData = val;
				return doesSessionTokenExistFromUserId(userData.id, tokenHash);
			})
			.then(function(exists){
				if(exists){
					return getSessionTokenFromTokenStringHash(md4Hash(token));
				}else{
					throw errors[16];
				}
			});
		},
		'writeReferenceToUser': function(id_user, referenceName, id_reference) {

			return doesUserExist(id_user)
				.then(function(exists) {
					if(exists){
						return writeReferenceToUser(true, id_user, referenceName, id_reference);
					}else{
						throw errors[6];
					}
				});
		}
	};

	return publicMethods;

};

module.exports = methods;