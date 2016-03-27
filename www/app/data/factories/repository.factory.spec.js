describe('saferota.data Repository', function () {
	beforeEach(module('saferota.data'));

	var repo, TestModel;

	beforeEach(inject(function (Model, Repository) {
		TestModel = new Model('TestModel').schema({name: 'default'});
		repo = new Repository(TestModel, 'LocalAdapterMemory', 'RemoteAdapterMemory');

		var m1 = TestModel.create({
				id: 1,
				name: 'James',
				updatedDate: new Date(2015,1,1)
			}),
			m2 = TestModel.create({
				id: 2,
				name: 'John',
				updatedDate: new Date(2015,1,1)
			}),
			m3 = TestModel.create({
				id: 3,
				name: 'Jack',
				updatedDate: new Date(2016,1,1)
			}),
			m4 = TestModel.create({
				id: 4,
				name: 'Jane',
				updatedDate: new Date(2016,1,1)
			});

		//init some cache
		repo._remote.save([m1,m2,m3,m4]);

	}));

	it('Can Create a repository',function(){
		expect(repo).toBeDefined();
	});

	/*
	Init local store 
	 */
	
	/*
	.fetch - should fetch all if local
	 */

	/*
	date comparison
	 */

	/*
	.fetch - differential
	 */

	/*
	.get - basic
	 */

	/*
	.find - basic
	 */

	/*
	.save - part 1
	 */
});