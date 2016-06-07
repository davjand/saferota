describe('saferota.core NetworkConnection', function () {
	beforeEach(function () {
		bard.appModule('saferota.core');
		bard.appModule('ngCordovaMocks');
		bard.inject('NetworkConnection', '$cordovaNetwork', '$window');
	});
	
	it('exists', function () {
		expect(NetworkConnection).toBeDefined();
	});
	
	describe('isWebView', function () {
		beforeEach(function () {
			spyOn($window.ionic.Platform, 'isWebView').and.returnValue(true);
		});
		it('.isOnline returns true if $cordovaNetwork returns true', function () {
			
			$cordovaNetwork.isConnected = true;
			expect(NetworkConnection.isOnline()).toBe(true);
		});
		it('.isOnline returns false if $cordovaNetwork returns false', function () {
			$cordovaNetwork.isConnected = false;
			expect(NetworkConnection.isOnline()).toBe(false);
		});
	});
	
	describe('isNotWebView', function () {
		beforeEach(function () {
			spyOn($window.ionic.Platform, 'isWebView').and.returnValue(false);
		});
		
		it('.isOnline returns the navigator value if not a webview', function () {
			expect(NetworkConnection.isOnline()).toBe(navigator.onLine);
			
		});
	});
	
	describe('.isOffline', function () {
		var isOnline = true;
		beforeEach(function () {
			spyOn(NetworkConnection, 'isOnline').and.returnValue(isOnline);
		});
		it('returns the negative of isOnline', function () {
			expect(NetworkConnection.isOffline()).toBe(false);
			
		});
	});
	
});