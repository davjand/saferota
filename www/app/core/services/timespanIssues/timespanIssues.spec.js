describe('saferota.core TimespanIssuesService', function () {
	beforeEach(function () {
		bard.appModule('saferota.core');
		bard.inject('TimespanIssuesService');
	});
	
	it('exists', function () {
		expect(TimespanIssuesService).toBeDefined();
	});
	
	it('.areIssues returns true if there are issues for a rota', function () {
		
	});
	it('.find returns all issues', function () {
		
	});
	it('.archive sets a timespan to archived', function () {
		
	});
	it('.approve sets an issue to resolved', function () {
		
	});
	it('.ammend triggers the edit view', function () {
		
	});
	it('.onIssueUpdate registers a callback whenever any loaded issues are changed', function () {
		
	});
	
	it('when issues are ', function () {
		
	});
	
});