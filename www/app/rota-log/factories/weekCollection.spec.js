describe('saferota.rota-log WeekCollection', function () {
	var collection;
	var june4, june6, june8, july4, july12, july29, july30;
	beforeEach(function () {
		bard.appModule('saferota.rota-log');
		module('saferota.tests');
		bard.inject('WeekCollection', 'RotaTimespan', 'moment', 'TestDateHelper');
		
		collection = new WeekCollection();
		
		june4 = TestDateHelper.timespan('2016-06-04 09:00:00.000'); //week 1
		june6 = TestDateHelper.timespan('2016-06-06 09:00:00.000'); //week 2
		june8 = TestDateHelper.timespan('2016-06-08 09:00:00.000'); //week 2
		
		july4 = TestDateHelper.timespan('2016-07-04 09:00:00.000'); //week 3
		july12 = TestDateHelper.timespan('2016-07-12 09:00:00.000'); //week 4
		july29 = TestDateHelper.timespan('2016-07-29 09:00:00.000'); //week 5
		july30 = TestDateHelper.timespan('2016-07-30 09:00:00.000'); //week 5
	});
	
	it('exists', function () {
		expect(WeekCollection).toBeDefined();
	});
	
	describe('.add', function () {
		
		it(' adds a rota timespan and saves it into a week object', function () {
			collection.add(june4);
			expect(collection.length()).toBe(1);
		});
		it('adds a timespan to an existing week if fits into one', function () {
			collection.add(june6);
			collection.add(june8);
			expect(collection.length()).toBe(1);
			expect(collection.items()[0].length()).toBe(2);
		});
		it('Accepts an array', function () {
			collection.add([june6, july30]);
			expect(collection.length()).toBe(2);
		});
	});
	
	it('findMatchingWeek returns a week if one is found', function () {
		collection.add(june6);
		expect(collection.findMatchingWeek(june8)).not.toBe(null);
	});
	it('findMatchingWeek return a null if no week is found', function () {
		collection.add(june6);
		expect(collection.findMatchingWeek(july12)).toBe(null);
	});
	
	
	it('asJSON returns object as a JSON object for the frontend', function () {
		collection.add([june6, june8, june4, july12, july30, july29]);
		var j = collection.asJSON();
		
		expect(j.length).toBe(4);
		
		expect(j[3].items.length).toBe(1);
		expect(j[2].items.length).toBe(2);
		expect(j[1].items.length).toBe(1);
		expect(j[0].items.length).toBe(2); //two in july
		
		var item = j[1];
		expect(item.start).toBeDefined();
		expect(item.end).toBeDefined();
	});
	
});