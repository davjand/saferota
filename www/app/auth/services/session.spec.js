xdescribe('saferota.auth Session', function () {

	beforeEach(module('saferota.auth'));
	beforeEach(inject(function ($q, Backendless,Session) {

		spyOn(Backendless.UserService, 'describeUserClass').and.callFake(function(){
			Session._handleDescribeUserClass({
				firstName: 'John',
				lastName: 'Doe',
				username: 'john@doe.com'
			});
		});
		spyOn(Backendless.UserService, 'getCurrentUser').and.returnValue("John");
	}));
	

	it('Can clear a session', inject(function (Session) {
		Session.user = {'firstName': 'David'};
		Session.isLoggedIn = true;

		Session.clear();

		expect(Session.isLoggedIn).toBeFalsy();
		expect(Session.user).toEqual(null);
	}));

});