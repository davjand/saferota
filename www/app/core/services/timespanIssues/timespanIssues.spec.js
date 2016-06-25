describe('saferota.core TimespanIssuesService', function () {
	
	var t1, t2, t3;
	beforeEach(function () {
		bard.appModule('saferota.core');
		bard.inject('TimespanIssuesService', 'DataStore', 'RotaTimespan', '$rootScope', '$q');
		
		t1 = RotaTimespan.create({
			unresolvedError: true,
			enter:           Date.now(),
			exit:            Date.now(),
			duration:        180
		});
		t2 = RotaTimespan.create({
			unresolvedError: true,
			enter:           Date.now(),
			exit:            Date.now(),
			duration:        180
		});
		t3 = RotaTimespan.create({
			unresolvedError: false,
			enter:           Date.now(),
			exit:            Date.now(),
			duration:        180
		});
	});
	
	function _d() {
		setTimeout(function ($rootScope) {
			$rootScope.$apply();
		}, 0, $rootScope);
	}

	it('exists', function () {
		expect(TimespanIssuesService).toBeDefined();
	});
	
	describe('finding issues', function () {
		beforeEach(function (done) {
			DataStore.save([t1, t2, t3], true, $rootScope).then(function () {
				done();
			});
			_d();
		});
		
		it('.loads issues when initialised', function () {
			expect(TimespanIssuesService.issues.items.length()).toBe(2);
		});
		
		it('.count returns the count', function () {
			expect(TimespanIssuesService.count()).toBe(2);
		});
		it('.areIssues returns true if there are issues for a rota', function () {
			expect(TimespanIssuesService.areIssues()).toBe(true);
		});
		
		it('issues are removed when they no longer match', function (done) {
			t1.unresolvedError = false;
			t2.unresolvedError = false;
			
			DataStore.save([t1, t2]).then(function () {
				expect(TimespanIssuesService.issues.items.length()).toBe(0);
				done();
			});
			_d();
		});

	});
	
	
	it('.remove sets a timespan to deleted', function () {
		TimespanIssuesService.remove(t1).then(function () {
			expect(t1.unresolvedError).toBe(false);
			expect(t1.deleted).toBe(true);
			
			expect(TimespanIssueService.count()).toBe(1);
		});
		_d();
	});
	it('.approve sets an issue to resolved', function () {
		TimespanIssuesService.approve(t1);
		expect(t1.unresolvedError).toBe(false);
	});
	
});