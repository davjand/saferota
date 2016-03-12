describe('saferota.auth Session', function () {

	beforeEach(module('saferota.auth'));
	beforeEach(inject(function ($q, $timeout, Backand) {

		spyOn(Backand, 'getUserDetails').and.returnValue($q.when({
			firstName: 'John',
			lastName: 'Doe',
			username: 'john@doe.com'
		}));
	}));


	it('Can save the session details into the session', function (done) {
		inject(function (Session,$rootScope) {
			Session.start().then(function () {
				expect(Session.user.firstName).toEqual('John');
				Session.clear();
				done();
			});
			$rootScope.$digest();
		});
	});

	it('Can clear a session', inject(function (Session) {
		Session.user = {'firstName': 'David'};
		Session.isLoggedIn = true;

		Session.clear();

		expect(Session.isLoggedIn).toBeFalsy();
		expect(Session.user).toEqual(null);
	}));

});