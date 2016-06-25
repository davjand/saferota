describe('saferota.rota-new NewRotaService', function () {
	beforeEach(function () {
		module('saferota.rota-new');
		module('allTemplates');
		bard.inject('$rootScope', 'NewRotaService', 'Rota', 'GoogleMaps', '$state', '$ionicHistory', '$ionicPopup');
		spyOn($state, 'go');
	});
	
	it('exists', function () {
		expect(NewRotaService).toBeDefined();
	});
	
	
	describe('getOrCreate', function () {
		var $scope;
		beforeEach(function () {
			$scope = $rootScope.$new();
			//dont want to call through as this function is recursive sometimes
			spyOn(Rota, 'create').and.returnValue({
				$register: function () {
				}
			});
		});
		
		it('will create a new rota if none is defined', function () {
			var rota = NewRotaService.getOrCreate();
			expect(Rota.create).toHaveBeenCalled();
		});
		it('will return the existing rota if already created', function () {
			var rota = NewRotaService.getOrCreate();
			rota = NewRotaService.getOrCreate();
			
			expect(Rota.create.calls.count()).toBe(1);
		});
	});
	
	describe('.start', function () {
		var googleMapsSuccess;
		beforeEach(function () {
			googleMapsSuccess = true;
			spyOn(GoogleMaps, 'continueIfLoadedOrPrompt').and.callFake(function (a, b) {
				googleMapsSuccess ? a() : b();
			});
			spyOn(NewRotaService, 'getOrCreate').and.returnValue('test');
		});
		
		it('returns getOrCreate', function () {
			expect(NewRotaService.start()).toBe('test');
			expect(NewRotaService.getOrCreate).toHaveBeenCalled();
		});
		it('calls google maps continueIfLoadedOrPrompt', function () {
			NewRotaService.start();
			expect(GoogleMaps.continueIfLoadedOrPrompt).toHaveBeenCalled();
		});
		it('calls .cancel if googlemaps fails', function () {
			googleMapsSuccess = false;
			spyOn(NewRotaService, 'cancel');
			NewRotaService.start();
			expect(NewRotaService.cancel).toHaveBeenCalled();
		});
		
		it('sets the state to START', function () {
			NewRotaService.state = null;
			NewRotaService.start();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.START);
		});
		
		it('should set shownLocationHelp to be false', function () {
			NewRotaService.shownLocationHelp = null;
			NewRotaService.start();
			expect(NewRotaService.shownLocationHelp).toBe(false);
		});
	});
	
	describe('.clear', function () {
		it('sets shwonLocationHelp to be false', function () {
			NewRotaService.showLocationHelp = true;
			NewRotaService.clear();
			expect(NewRotaService.shownLocationHelp).toBe(false);
		});
	});
	
	
	describe('.next when in start state', function () {
		beforeEach(function () {
			NewRotaService.start();
		});
		it('redirects to .location and changes state', function () {
			NewRotaService.next();
			expect($state.go).toHaveBeenCalled();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.LOCATION);
		});
		it('creates a new location if one doesnot exist and redirects', function () {
			NewRotaService.next();
			expect($state.go).toHaveBeenCalledWith('app.new-location', {
				locationId: NewRotaService.locations[0].getKey()
			});
		});
		it('sets the current location state', function () {
			NewRotaService.next();
			expect(NewRotaService.currentLocationState).toBe(0);
			
		});
	});
	describe('.next when in LOCATION state', function () {
		beforeEach(function () {
			NewRotaService.start();
			NewRotaService.next();
		});
		it('goes to the SETTINGS state and sets currentLocation to null', function () {
			NewRotaService.next();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.SETTINGS);
			expect(NewRotaService.currentLocationState).toBe(null);
			expect($state.go).toHaveBeenCalledWith('app.new-settings');
			
		});
		it('goes to the next location if more than one', function () {
			NewRotaService.createLocation();
			NewRotaService.next();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.LOCATION);
			expect(NewRotaService.currentLocationState).toBe(1);
			expect($state.go).toHaveBeenCalledWith('app.new-location', {
				locationId: NewRotaService.locations[1].getKey()
			});
		});
	});
	
	describe('.next when in SETTINGS state', function () {
		beforeEach(function () {
			NewRotaService.start();
			NewRotaService.next();
			NewRotaService.next();
		});
		it('goes to complete state', function () {
			NewRotaService.next();
			$rootScope.$apply();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.COMPLETE);
			expect($state.go).toHaveBeenCalledWith('app.new-complete');
			
		});
	});
	
	it('.getCurrentLocation gets the current location state', function () {
		NewRotaService.start();
		NewRotaService.next();
		expect(NewRotaService.getCurrentLocation().getKey()).toBe(
			NewRotaService.locations[0].getKey()
		);
		
		NewRotaService.createLocation();
		NewRotaService.next();
		expect(NewRotaService.getCurrentLocation().getKey()).toBe(
			NewRotaService.locations[1].getKey()
		);
		
	});
	
	describe('.back', function () {
		beforeEach(function () {
			spyOn($ionicHistory, 'goBack');
			
			NewRotaService.start();
		});
		it('calls cancel when in the start state', function () {
			spyOn(NewRotaService, 'cancel');
			NewRotaService.back();
			expect(NewRotaService.cancel).toHaveBeenCalled();
		});
		it('resets the currentLocation and calls ionichistory.goBack', function () {
			NewRotaService.next();
			NewRotaService.back();
			
			expect(NewRotaService.currentLocationState).toBe(null);
			expect($ionicHistory.goBack).toHaveBeenCalled();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.START);
		});
		it('decrements the currentLocation if currentLocationState is > 1', function () {
			NewRotaService.next();
			NewRotaService.createLocation();
			NewRotaService.next();
			NewRotaService.back();
			
			expect(NewRotaService.currentLocationState).toBe(0);
			expect($ionicHistory.goBack).toHaveBeenCalled();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.LOCATION);
		});
		it('goes to the last location if on settings page', function () {
			NewRotaService.next();
			NewRotaService.createLocation();
			NewRotaService.next();
			NewRotaService.next();
			NewRotaService.back();
			
			expect(NewRotaService.currentLocationState).toBe(1);
			expect($ionicHistory.goBack).toHaveBeenCalled();
			expect(NewRotaService.state).toBe(NewRotaService.STATES.LOCATION);
		});
	});
	
	describe('showLocationHelp', function () {
		beforeEach(function () {
			NewRotaService.clear();
			spyOn($ionicPopup, 'show');
		});
		it('should show an ionic popup', function () {
			NewRotaService.showLocationHelp();
			expect($ionicPopup.show).toHaveBeenCalled();
		});
		it('should only show the popup once', function () {
			NewRotaService.showLocationHelp();
			NewRotaService.showLocationHelp();
			expect($ionicPopup.show.calls.count()).toBe(1);
		});
		it('should show the popup again if cleared', function () {
			NewRotaService.showLocationHelp();
			NewRotaService.showLocationHelp();
			
			NewRotaService.clear();
			NewRotaService.showLocationHelp();
			expect($ionicPopup.show.calls.count()).toBe(2);
		});
	});
	
	
});