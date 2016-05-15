describe('saferota.core Session', function () {

	var $q, Backendless, Session, $rootScope;

	beforeEach(module('saferota.core'));
	beforeEach(inject(function (_$q_, _Backendless_, _Session_, _$rootScope_) {
		$q = _$q_;
		Backendless = _Backendless_;
		Session = _Session_;
		$rootScope = _$rootScope_;
	}));

	function _d() {
		$rootScope.$digest();
	}


	xit('Can clear a session', inject(function (Session) {
		Session.user = {'firstName': 'David'};
		Session.isLoggedIn = true;

		Session.clear();

		expect(Session.isLoggedIn).toBeFalsy();
		expect(Session.user).toEqual(null);
	}));

});