describe('saferota.rota-new NewLocationController', function () {
	
	var controller, $scope;
	
	beforeEach(function () {
		module('saferota.rota-new');
		module('allTemplates');
		bard.inject('$controller', '$rootScope', 'NewRotaService', '$state', '$q', '$ionicPopup');
		$scope = $rootScope.$new();
		
		spyOn($state, 'go');
		NewRotaService.start();
		NewRotaService.next();
		
		controller = $controller('NewLocationController', {$scope: $scope});
	});
	
	it('exists', function () {
		expect(controller).toBeDefined();
	});
	
	describe('.save', function () {
		var popupResponse;
		beforeEach(function () {
			popupResponse = true;
			spyOn($ionicPopup, 'confirm').and.callFake(function () {
				return $q.when(popupResponse);
			});
			spyOn(NewRotaService, 'next');
			spyOn(NewRotaService, 'createLocation').and.callThrough();
		});
		
		it('creates a new location if "cancel" button is pressed', function () {
			popupResponse = false;
			controller.save();
			
			$rootScope.$apply();
			
			expect(NewRotaService.createLocation).toHaveBeenCalled();
			expect(NewRotaService.next).toHaveBeenCalled();
		});
		
		it('just calls next if ok button pressed', function () {
			popupResponse = true;
			controller.save();
			
			$rootScope.$apply();
			
			expect(NewRotaService.createLocation).not.toHaveBeenCalled();
			expect(NewRotaService.next).toHaveBeenCalled();
		});
		
	});
	
	
});