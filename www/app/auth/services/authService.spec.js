describe('saferota.auth AuthService', function () {
	beforeEach(module('saferota.auth'));

	it('Can Parse a name into a firstname and surname', inject(function (AuthService) {
		var r = AuthService._parseName('John Doe');
		expect(r.first).toEqual('John');
		expect(r.last).toEqual('Doe');
	}));
	it('Can parse a name with multiple spaces in', inject(function (AuthService) {
		var r = AuthService._parseName('John Sanderson Doe');

		expect(r.first).toEqual('John');
		expect(r.last).toEqual('Sanderson Doe');
	}));
	it('Can parse a name with only one name', inject(function (AuthService) {
		var r = AuthService._parseName('John');

		expect(r.first).toEqual('John');
		expect(r.last).toEqual('');
	}));


	/*

	Login

	 */
	/*	xit('Login: Starts a Session and broadcasts a login message', function (done) {
		inject(function (AuthService, Session, Backand, $q, AUTH_EVENTS, $rootScope) {

			spyOn(Backand, 'signin').and.returnValue($q.when({}));
			spyOn(Session, 'start').and.returnValue($q.when({}));

			var event = false;
			var listener = $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
				event = true;
			});

			AuthService.login('test', 'test').then(function () {
				//should have called session start
				expect(Session.start).toHaveBeenCalled();
				expect(Backand.signin).toHaveBeenCalled();

				//should have fired the event
				expect(event).toBeTruthy();

				//deregister the listener
				listener();
				done();
			});
			$rootScope.$digest();
		});
	 });*/

	/*

	Signup

	 */
	/*xit('Signup: Starts a Session and broadcasts a login message', function (done) {
		inject(function (AuthService, Session, Backendless, $q, AUTH_EVENTS, $rootScope) {

			spyOn(Backendless.UserService, 'register').and.returnValue($q.when({}));
			spyOn(Session, 'start').and.returnValue($q.when({}));

			var event = false;
			var listener = $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
				event = true;
			});

			AuthService.signup('test', 'test', 'test').then(function () {
				//should have called session start
				expect(Session.start).toHaveBeenCalled();
				expect(Backendless.UserService.register).toHaveBeenCalled();

				//should have fired the event
				expect(event).toBeTruthy();

				//deregister the listener
				listener();
				done();
			});
			$rootScope.$digest();
		});
	 });*/

	/*

	 Reset Password

	 */
	/*xit('Reset Password calls BackanD API', function (done) {
		inject(function (AuthService, Backand, $q, $rootScope) {

			spyOn(Backand, 'requestResetPassword').and.returnValue($q.when({}));

			AuthService.resetPassword('test').then(function () {
				expect(Backand.requestResetPassword).toHaveBeenCalled();
				done();
			});
			$rootScope.$digest();
		});
	 });*/

	/*

	Logout

	 */
	/*xit('Logout calls Backand API, clears the session and triggers an event', function (done) {
		inject(function (AuthService, Session, Backand, $q, AUTH_EVENTS, $rootScope) {

			spyOn(Backand, 'signout').and.returnValue($q.when({}));
			spyOn(Session, 'clear').and.returnValue($q.when({}));

			var event = false;
			var listener = $rootScope.$on(AUTH_EVENTS.logoutSuccess, function () {
				event = true;
			});

			AuthService.logout().then(function () {
				//should have called session start
				expect(Session.clear).toHaveBeenCalled();
				expect(Backand.signout).toHaveBeenCalled();

				//should have fired the event
				expect(event).toBeTruthy();

				//deregister the listener
				listener();
				done();
			});
			$rootScope.$digest();
		});
	 });*/



});