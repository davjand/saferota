describe('saferota.core GoogleMaps', function () {
	var isOnline = true;
	
	beforeEach(function () {
		bard.appModule('saferota.core');
		bard.inject('NetworkConnection', '$q', '$rootScope', 'NETWORK_MSG', '$window', '$ionicPopup');
		
		spyOn(NetworkConnection, 'isOnline').and.callFake(function () {
			return isOnline;
		});
		
		
	});
	
	it('exists', function () {
		bard.inject('GoogleMaps');
		expect(GoogleMaps).toBeDefined();
	});
	
	
	describe('when isOnline at startup', function () {
		
		beforeEach(function () {
			isOnline = true;
			bard.inject('GoogleMaps');
			spyOn(GoogleMaps, 'loadGoogleMapsAPI').and.callThrough();
		});
		
		it('loads the maps api if online', function () {
			GoogleMaps.activate();
			expect(GoogleMaps.loadGoogleMapsAPI).toHaveBeenCalled();
		});
		
		it('sets self.isLoaded to true when the maps have loaded', function () {
			GoogleMaps.setupGoogleMapsLoadedCallback();
			$window.mapInit();
			expect(GoogleMaps.$isLoaded).toBe(true);
		});
		
	});
	
	describe('when isOffline at startup', function () {
		beforeEach(function () {
			isOnline = false;
			bard.inject('GoogleMaps');
			spyOn(GoogleMaps, 'loadGoogleMapsAPI');
			GoogleMaps.activate();
		});
		it('does not load the maps api if online', function () {
			expect(GoogleMaps.loadGoogleMapsAPI).not.toHaveBeenCalled();
		});
		it('listens to $rootScope for NETWORK_MSG.ONLINE and goes online.', function () {
			$rootScope.$emit(NETWORK_MSG.ONLINE);
			expect(GoogleMaps.loadGoogleMapsAPI).toHaveBeenCalled();
		});
		it('Only listens to NETWORK_MSG.ONLINE ONCE', function () {
			$rootScope.$emit(NETWORK_MSG.ONLINE);
			$rootScope.$emit(NETWORK_MSG.ONLINE);
			expect(GoogleMaps.loadGoogleMapsAPI.calls.count()).toBe(1);
		});
	});
	
	describe('continueIfLoadedOrPrompt', function () {
		var confirmResult;
		
		beforeEach(function () {
			isOnline = true;
			confirmResult = true;
			
			bard.inject('GoogleMaps');
			
			spyOn($ionicPopup, 'confirm').and.callFake(function () {
				return $q.when(confirmResult);
			});
		});
		
		it('will call the continue callback if loaded', function () {
			var hasBeenCalled = false;
			GoogleMaps.$isLoaded = true;
			GoogleMaps.continueIfLoadedOrPrompt(function () {
				hasBeenCalled = true
			});
			expect(hasBeenCalled).toBe(true);
		});
		
		it('will show a prompt message if not loaded', function () {
			GoogleMaps.$isLoaded = false;
			//attempt to load
			GoogleMaps.continueIfLoadedOrPrompt(function () {
				expect(false).toBe(true);
			});
			expect($ionicPopup.confirm.calls.count()).toBe(1);
		});
		it('will call the success callback if online when prompt is retried', function () {
			confirmResult = true;
			GoogleMaps.$isLoaded = false;
			var hasBeenCalled = false;
			
			GoogleMaps.continueIfLoadedOrPrompt(function () {
				hasBeenCalled = true
			});
			
			expect(hasBeenCalled).toBe(false);
			GoogleMaps.$isLoaded = true;
			
			$rootScope.$apply(); //resolve the promise
			
			expect(hasBeenCalled).toBe(true);
			
			//should be nullified
			expect(GoogleMaps.$$prompt).toBeNull();
			expect(GoogleMaps.$$promptCallback).toBeNull();
			
		});
		
		it('will call the cancel callback if prompt cancelled', function () {
			GoogleMaps.$isLoaded = false;
			confirmResult = false;
			
			var cancelCallbackHasBeenCalled = false;
			//attempt to load
			GoogleMaps.continueIfLoadedOrPrompt(function () {
				expect(false).toBe(true);
			}, function () {
				cancelCallbackHasBeenCalled = true;
			});
			expect($ionicPopup.confirm.calls.count()).toBe(1);
			
			$rootScope.$apply();
		});
		
		it('.mapInit callback will remove the current prompt and call the success callback if loaded whilst a prompt present', function () {
			GoogleMaps.$isLoaded = false;
			confirmResult = false;
			
			var continueCalled = false;
			var promptClosed = false;
			
			GoogleMaps.setupGoogleMapsLoadedCallback();
			GoogleMaps.continueIfLoadedOrPrompt(function () {
				continueCalled = true;
			});
			expect(continueCalled).toBe(false);
			
			//Mock the Prompt functionality
			expect(GoogleMaps.$$prompt).not.toBeNull();
			GoogleMaps.$$prompt.close = function () {
				promptClosed = true;
			};
			
			$window.mapInit();
			
			expect(promptClosed).toBe(true);
			expect(continueCalled).toBe(true);
			
			//should nulify these
			expect(GoogleMaps.$$prompt).toBeNull();
			expect(GoogleMaps.$$promptCallback).toBeNull();
		});
		
	});
	
	
});