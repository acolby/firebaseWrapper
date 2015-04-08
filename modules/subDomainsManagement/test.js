
function testCreator(firebaseRootURL, firebaseSecret){

	var subDomainsManagement = require('./')(firebaseRootURL, firebaseSecret);

	var errors = require('./errors.json');

	var test = {};

	var id_subDomain = null;
	test.creatingSubDomains = {
		'add subDomain succesfully': function(test){
			subDomainsManagement.addSubDomain('testsubdomain')
			.then(function(successObj){
				test.equal(successObj.id_subDomain !== undefined, true);
				id_subDomain = successObj.id_subDomain;
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
		'subdomain exists': function(test){
			subDomainsManagement.addSubDomain('testsubdomain')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[18]);
				test.done();
			});
		}
	};

	test.writeReferenceToSubDomain = {
		'team does not exist': function(test){
			subDomainsManagement.writeReferenceToSubDomain('asdfasdfasdfasdf', 'testuserasdfasdfasdf', 'medudeeer')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[19]);
				test.done();
			});
		},
		'add test referecne': function(test){
			subDomainsManagement.writeReferenceToSubDomain(id_subDomain, 'test', 'asdfasdfasdf')
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
	};

	test.doesSubdomainExist = {
		'test true': function(test){
			subDomainsManagement.doesSubDomainExist('testsubdomain')
			.then(function(successObj){
				test.equal(successObj, true);
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
		'test false': function(test){
			subDomainsManagement.doesSubDomainExist('doesnotexistdomain')
			.then(function(successObj){
				test.equal(successObj, false);
				test.done();
			}).catch(function(error){
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