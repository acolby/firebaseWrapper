var Firebase = require('Firebase');
var rootRef = new Firebase('https://tttests.firebaseio.com/');
var secret = 'cI2lwD7QVtvRLTn8gGuBGawbKHdN0NYTHQg3rgYv';

test = {};

test.setTestDb = {
	'set': function(test){
		rootRef.set({}, function(err){
			if(!err){
				test.done();
			}else{
				throw new Error('error pushing test db');
			}
		});
	}
};

//add other tests to test object
test.sessionManagement = require('./modules/usersAndSessionsManagement/test.js')(rootRef, secret);
test.teamsManagement = require('./modules/teamsManagement/test.js')(rootRef, secret);
test.subDomainsManagement = require('./modules/subDomainsManagement/test.js')(rootRef, secret);

module.exports = test;