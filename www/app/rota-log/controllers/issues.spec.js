describe('saferota.rota-log RotaIssuesController', function () {
	
	var controller, $scope;
	
	beforeEach(function () {
		bard.appModule('saferota.rota-log');
		bard.inject('$controller', '$rootScope');
		$scope = $rootScope.$new();
		controller = $controller('RotaIssuesController', {$scope: $scope});
	});
	
	it('exists', function () {
		expect(controller).toBeDefined();
	});
	
	
});