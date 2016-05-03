xdescribe('SafeRota Core: User Object', function () {

	beforeEach(module('saferota.core'));

	it('Can set the user defaults', inject(function (User) {
		var user = new User();

		expect(user.username).toEqual('');
	}));
	it('Can get the fullname', inject(function (User) {
		var user = new User({
			firstName: 'John',
			lastName: 'Doe'
		});

		expect(user.getFullName()).toEqual('John Doe');
	}));
});