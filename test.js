var Firebase = require('Firebase');
var testDB = require('./auth.json');
var rootRef = new Firebase(testDB.firebaseTestUrl);
var secret = testDB.firebaseTestSecret;

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

//run last test
test.lastTest = function(test){
    //do_clear_all_things_if_needed();
    setTimeout(process.exit, 500); // exit in 500 milli-seconds    
    test.done();
} ;

module.exports = test;