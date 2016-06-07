describe('saferota.rota-new NewRotaSettingsController', function () {
	
	var controller, $scope;
	
	beforeEach(function () {
		module('saferota.rota-new');
		module('allTemplates');
		bard.inject('$controller', '$rootScope', '$state');
		
		spyOn($state, 'go');
		
		$scope = $rootScope.$new();
		controller = $controller('NewRotaSettingsController', {$scope: $scope});
	});
	
	it('exists', function () {
		expect(controller).toBeDefined();
	});
	
	
});