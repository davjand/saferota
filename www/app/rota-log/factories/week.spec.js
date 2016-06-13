describe('saferota.rota-log Week', function () {
	var midWeekDate;
	
	beforeEach(function () {
		module('saferota.rota-log');
		module('saferota.tests');
		bard.inject('Week', 'TestDateHelper');
		
		midWeekDate = TestDateHelper.dateFromTimestamp('2016-06-15 09:10:10:111');
		
	});
	
	it('exists', function () {
		expect(Week).toBeDefined();
	});
	
	it('getStartOfWeek returns a starting date for a week', function () {
		TestDateHelper.expectEqualTimestamp(
			Week.getStartOfWeek(midWeekDate),
			'2016-06-13 00:00:00.000'
		);
	});
	
	
	it('getEndOFWeek returns a ending date for a week', function () {
		TestDateHelper.expectEqualTimestamp(
			Week.getEndOfWeek(midWeekDate),
			'2016-06-19 23:59:59.999'
		);
	});
	
	it('setFromDate takes a date and builds the week object', function () {
		var week = new Week();
		
		week.setFromDate(
			TestDateHelper.dateFromTimestamp('2016-06-15 09:10:10:111')
		);
		
		TestDateHelper.expectEqualTimestamp(week.start, '2016-06-13 00:00:00.000');
		TestDateHelper.expectEqualTimestamp(week.end, '2016-06-19 23:59:59.999');
	});
	
	it('Can be initialized with a fromDate to build a week object', function () {
		var week = new Week(
			TestDateHelper.dateFromTimestamp('2016-06-15 09:10:10:111')
		);
		
		TestDateHelper.expectEqualTimestamp(week.start, '2016-06-13 00:00:00.000');
		TestDateHelper.expectEqualTimestamp(week.end, '2016-06-19 23:59:59.999');
	});
	
	describe('.in', function () {
		var date;
		
		beforeEach(function () {
			date = TestDateHelper.date('2016-06-15 09:10:10:111');
		});
		
		it('returns true if a date is in the week', function () {
			var week = new Week(date);
			expect(week.in(date)).toBe(true);
		});
		it('returns false if a date is not in the week', function () {
			var week = new Week(date);
			expect(week.in(
				TestDateHelper.date('2016-07-15 09:10:10:111')
			)).toBe(false);
		});
		
		it('returns true if equal to start date', function () {
			var week = new Week(date);
			expect(week.in(week.start)).toBe(true);
		});
		it('returns true if equal to end date', function () {
			var week = new Week(date);
			expect(week.in(week.end)).toBe(true);
		});
	});
	
	describe('.addTimespan', function () {
		var june4, june6, june8, june8Date, june7, june7Lunch,
			week;
		
		beforeEach(function () {
			june4 = TestDateHelper.timespan('2016-06-04 09:00:00.000'); //week 1
			june6 = TestDateHelper.timespan('2016-06-06 09:00:00.000'); //week 2
			june8 = TestDateHelper.timespan('2016-06-08 09:00:00.000'); //week 2
			june8Date = TestDateHelper.date('2016-06-08 09:00:00.000'); //week 2
			
			june7 = TestDateHelper.timespan('2016-06-07 09:00:00.000'); //week 2
			june7Lunch = TestDateHelper.timespan('2016-06-07 12:00:00.000'); //week 2
			
			week = new Week(june8Date);
		});
		
		it('does not add the timespan if outside the week', function () {
			week.addTimespan(june4);
			expect(week.collection().length()).toBe(0);
		});
		
		it('adds a timespan if in the week', function () {
			week.addTimespan(june8);
			expect(week.collection().length()).toBe(1);
		});
		it('accepts an array', function () {
			week.addTimespan([june8, june7]);
			expect(week.collection().length()).toBe(2);
		});
		
		it('accepts multiple dates and orders them appropriately', function () {
			week.addTimespan([june7, june8, june6, june7Lunch]);
			
			var collection = week.collection();
			
			expect(collection.length()).toBe(4);
			expect(collection.get(3)).toEqual(june6);
			expect(collection.get(2)).toEqual(june7);
			expect(collection.get(1)).toEqual(june7Lunch);
			expect(collection.get(0)).toEqual(june8);
		});
	});
	
	describe('isSame', function () {
		var week;
		beforeEach(function () {
			week = new Week(TestDateHelper.date('2016-06-15 00:10:10:111'));
		});
		
		it('returns true if the same week', function () {
			expect(week.isSame(
				new Week(TestDateHelper.date('2016-06-15 00:10:10:111'))
			)).toBe(true);
		});
		it('returns false if different week', function () {
			expect(week.isSame(
				new Week(TestDateHelper.date('2016-06-05 00:10:10:111'))
			)).toBe(false);
			expect(week.isSame(
				new Week(TestDateHelper.date('2016-06-25 00:10:10:111'))
			)).toBe(false);
		});
	});
	
});