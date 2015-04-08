
function testCreator(firebaseRootURL, firebaseSecret){

	var firebaseWrapper = require('./')(firebaseRootURL, firebaseSecret);
	var errors = require('./errors.json');

	var test = {};
	var userData = {};

	var tokenToRemove = null;
	var validToken = null;

	test.addEmail = {
		'adding new email for activated user': function(test){
			firebaseWrapper.addEmail('activatedUser@live.com')
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
			});
		},
		'adding new email for unactivated': function(test){
			firebaseWrapper.addEmail('unactivatedUser@live.com')
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
			});
		},
		'adding email that exists already': function(test){
			firebaseWrapper.addEmail('activatedUser@live.com')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[0]);
				test.done();
			});
		},
	};
	test.getUserFromEmailAddress = {
		'user does not exist': function(test){
			firebaseWrapper.getUserFromEmailAddress('mcChicken@live.com')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		},
		'user does exist': function(test){
			firebaseWrapper.getUserFromEmailAddress('activatedUser@live.com')
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
	test.getUserFromUserId = {
		'user does not exist': function(test){
			firebaseWrapper.getUserFromUserId('Aimmmasdfasdfasdfasdfsaf')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		},
		'user does exist': function(test){
			firebaseWrapper.getUserFromUserId(userData.id)
			.then(function(successObj){
				test.equal(typeof successObj === 'object', true);
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
			});
		}
	};
	test.activateAccount = {
		'checking invalid token': function(test){
			firebaseWrapper.activateAccount('activatedUser@live.com', 'thisisthepass!!', 'medudeeer', 'asdfasdfasdfasdfasdfasdf')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[4]);
				test.done();
			});
		},
		'activate user account': function(test){
			firebaseWrapper.activateAccount('activatedUser@live.com', 'thisisthepass!!', 'medudeeer', userData.createAccountToken.value)
			.then(function(successObj){
				test.deepEqual(successObj, {});
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
			});
		},
		'user exist already': function(test){
			firebaseWrapper.activateAccount('activatedUser@live.com', 'thisisthepass!!', 'medudeeer', userData.createAccountToken.value)
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[5]);
				test.done();
			});
		},
		'non existant email': function(test){
			firebaseWrapper.activateAccount('activaasdf@e.com', 'tasdfs!!', 'medudeeer', userData.createAccountToken.value)
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		}
	};
	test.changePassword = {
		'wrong old password': function(test){
			firebaseWrapper.changePassword('activatedUser@live.com', 'wrongOldPass!!', 'thiswouldBeWhatIWouldLikeToSetItTOO')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[7]);
				test.done();
			});
		},
		'user non existant': function(test){
			firebaseWrapper.changePassword('activateasdfasdfdUser@live.com', 'wrongOldPass!!', 'thiswouldBeWhatIWouldLikeToSetItTOO')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		},
		'same password': function(test){
			firebaseWrapper.changePassword('activatedUser@live.com', 'thisisthepass!!', 'thisisthepass!!')
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
			});
		},
		'change password': function(test){
			firebaseWrapper.changePassword('activatedUser@live.com', 'thisisthepass!!', 'pandora')
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
			});
		}
	};
	test.getFirebaseLoginToken = {
		'invalid email': function(test){
			firebaseWrapper.getFirebaseLoginToken('asdfasdf@sadfas.com', 'testuserasdfasdfasdf')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		},
		'user is not activated': function(test){
			firebaseWrapper.getFirebaseLoginToken('unactivatedUser@live.com', 'testuserasdfasdfasdf')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[12]);
				test.done();
			});
		},
		'incorrect password': function(test){
			firebaseWrapper.getFirebaseLoginToken('activatedUser@live.com', 'thisasdfasdfisthepass!!')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[15]);
				test.done();
			});
		},
		'success getting firebase token': function(test){
			firebaseWrapper.getFirebaseLoginToken('activatedUser@live.com', 'pandora')
			.then(function(successObj){
				test.equal(typeof successObj === 'string', true);
				validToken = successObj;
				test.done();
			}).catch(function(error){
				console.log(error);
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
		'wait before requesting next token': function(test){
			setTimeout(function(){
				test.done();
			},1000);
		},
		'success getting firebase token to delete': function(test){
			firebaseWrapper.getFirebaseLoginToken('activatedUser@live.com', 'pandora')
			.then(function(successObj){
				test.equal(typeof successObj === 'string', true);
				tokenToRemove = successObj;
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		}
	};
	test.removingTokens = {
		'remove token from user': function(test){
			firebaseWrapper.removeFirebaseLoginToken(userData.id, tokenToRemove)
			.then(function(successObj){
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		}
	};
	test.gettingSessionTokens = {
		'token is invalid': function(test){
			firebaseWrapper.getSessionToken(userData.id, 'asdfasdfasdfasdf')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
				test.done();
			}).catch(function(error){
				test.deepEqual(error, errors[16]);
				test.done();
			});
		},
		'token is expired': function(test){
			firebaseWrapper.getSessionToken(userData.id, tokenToRemove)
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
				test.done();
			}).catch(function(error){
				test.deepEqual(error, errors[16]);
				test.done();
			});
		},
		'success getting token': function(test){
			firebaseWrapper.getSessionToken(userData.id, validToken)
			.then(function(successObj){
				
				test.done();
			}).catch(function(error){
				FAILTEST(test, 'should not reject');
				test.done();
			});
		},
	};
	test.writeReferenceToUser = {
		'team does not exist': function(test){
			firebaseWrapper.writeReferenceToUser('asdfasdfasdfasdf', 'testuserasdfasdfasdf', 'medudeeer')
			.then(function(successObj){
				FAILTEST(test, 'should not resolve');
			}).catch(function(error){
				test.deepEqual(error, errors[6]);
				test.done();
			});
		},
		'add test referecne': function(test){
			firebaseWrapper.writeReferenceToUser(userData.id, 'ids_tests', 'asdfasdfasdf')
			.then(function(successObj){
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