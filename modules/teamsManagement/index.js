var Firebase = require('firebase');
var FF = require('../../firebaseFactories');
var Q = require('q');
var errors = require('./errors.json');

var methods = function(rootUrl, secret) {

	// Refs
	var usersRef = new Firebase(rootUrl + 'users');
	var teamsRef = new Firebase(rootUrl + 'teams');

	// -- DOES EXIST FUNCTIONS
	var doesTeamExist = FF.doesExistFactory(teamsRef, '*');

	// -- GET VALUE AT LOCATION FUNCTION
	var getUserFromUserId = FF.getValueAtLocationFactory(usersRef, '*', errors[6]);

	// -- PUSH FUNCTIONS
	var pushObjectToTeams = FF.pushValueToLocationFactory(teamsRef);

	// -- WRITE FUNCTIONS
	var writeTeamToUser = FF.writeValueToLocationFactory(usersRef, '*/ids_teams/*');
	var writeUserToTeamMembers = FF.writeValueToLocationFactory(teamsRef, '*/members/*');
	var writeReferenceToTeam = FF.writeValueToLocationFactory(teamsRef, '*/*/*');

	// FUNCTIONS THAT REMOVE DATA

	// PUBLIC:  methods that get exported
	var publicMethods = {

		// managing teams
		'addTeam': function(creatorId, teamName) {
			var teamData = {
				'name': (teamName) ? (teamName) : (''),
				'created': Firebase.ServerValue.TIMESTAMP
			};
			var id_team = null;
			var userData = null;

			return getUserFromUserId(creatorId)
				.then(function(successObj) {
					userData = successObj;
					return pushObjectToTeams(teamData);
				})
				.then(function(id) {
					id_team = id;
					var memberObject = {
						'id': creatorId,
						'email': userData.email,
						'isOwner': true,
						'isAdmin': true,
						'isInviter': true,
						'invitation': {
							'pending': false
						}
					};
					return Q.all([writeUserToTeamMembers(memberObject, id_team, creatorId), writeTeamToUser(true, creatorId, id_team)]);
				}).
				then(function(){
					return({'id_team': id_team});
				});
		},

		'writeReferenceToTeam': function(id_team, referenceName, id_reference) {
			return doesTeamExist(id_team)
				.then(function(exists) {
					if(exists){
						return writeReferenceToTeam(true, id_team, referenceName, id_reference);
					}else{
						throw errors[17];
					}
				});
		}
	};

	return publicMethods;

};

module.exports = methods;