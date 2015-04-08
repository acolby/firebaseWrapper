
function testCreator(firebaseRootURL, firebaseSecret){

	var teamsManagement = require('./')(firebaseRootURL, firebaseSecret);
	var usersManagement = require('../usersAndSessionsManagement')(firebaseRootURL, firebaseSecret);
	var errors = require('./errors.json');

	var test = {};
	var userData = {};

	test.getUserFromEmailAddress = {
		'user does exist': function(test){
			usersManagement.getUserFromEmailAddress('activatedUser@live.com')
			.then(function(successObj){
				test.equal(typeof successObj === 'object', true);
				test.equal(successObj.email === 'activatedUser@live.com', true);
				userData = successObj;
				test.done();
			}).catch(function(error){
				consoele.log(error);
				FAILTEST(test, 'should not reject');
			});
		}
	};

	var id_team = null;
	test.creatingTeams = {
		'invalid user id': function(test){
			teamsManagement.addTeam('testsubdomain', 'testuserasdfasdfasdf', 'medudeeer', userData.createAccountToken.value)
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		},
		'success creating team': function(test){
			teamsManagement.addTeam(userData.id, 'my team name', userData.createAccountToken.value)
			.then(function(successObj){
				test.equal(successObj.id_team !== undefined, true);
				id_team = successObj.id_team;
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
	};

	test.writeReferenceToTeam = {
		'team does not exist': function(test){
			teamsManagement.writeReferenceToTeam('asdfasdfasdfasdf', 'testuserasdfasdfasdf', 'medudeeer')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[17]);
				test.done();
			});
		},
		'add test referecne': function(test){
			teamsManagement.writeReferenceToTeam(id_team, 'test', 'asdfasdfasdf')
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				console.log(error);
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
	};

	return test;

}


function FAILTEST(test, message){
	if(message){
		console.log(message);
	}
	test.equal(true, false);
	test.done();
}

module.exports = testCreator;