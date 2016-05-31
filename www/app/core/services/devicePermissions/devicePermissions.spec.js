describe('saferota.core DevicePermissions', function () {
	beforeEach(module('saferota.core'));
	
	var $window, DevicePermissions, $q, $ionicModal, $rootScope, locationResponse;
	
	beforeEach(inject(function (_$window_, _DevicePermissions_, _$q_, _$ionicModal_, _$rootScope_) {
		$window = _$window_;
		DevicePermissions = _DevicePermissions_;
		$q = _$q_;
		$ionicModal = _$ionicModal_;
		$rootScope = _$rootScope_;
		
		/*
		 * Set locationResponse
		 * to true/false for a permission response
		 * to null for an error
		 */
		locationResponse = true;
		$window.cordova = {
			plugins: {
				diagnostic: {
					/*
					 * Mock of the isLocationEnabledFunction
					 */
					isLocationEnabled: function (success, error) {
						if (locationResponse === true) {
							success(true);
						} else if (locationResponse === false) {
							success(false);
						} else {
							error('error');
						}
					}
				}
			}
		};
		DevicePermissions.activate();
	}));
	
	afterEach(function () {
		delete $window.cordova;
	});
	
	
	it('Can detect when the cordova.plugin.diagnostics object is available', function () {
		expect(DevicePermissions.apiIsEnabled()).toBe(true);
	});
	
	
	it('Can detect when the cordova.plugin.diagnostics object is not available', function () {
		$window.cordova = null;
		DevicePermissions.activate();
		expect(DevicePermissions.apiIsEnabled()).toBe(false);
	});
	
	
	it('Can check the location permissions', function (done) {
		DevicePermissions.activate();
		DevicePermissions.getLocationPermissions().then(function (result) {
			expect(result).toBe(true);
			done();
		});
		$rootScope.$digest();
	});
	
	it('Handles an error checking location permissions', function (done) {
		locationResponse = null;
		DevicePermissions.activate();
		DevicePermissions.getLocationPermissions().then(function (result) {
			expect(result).toBe(false);
			done();
		});
		$rootScope.$digest();
	});
	
});