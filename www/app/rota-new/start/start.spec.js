describe('saferota.rota-new NewRotaStartController', function () {
	
	var controller, $scope;
	
	beforeEach(function () {
		bard.appModule('saferota.rota-new');
		module('allTemplates');
		bard.inject('$controller', '$ionicPopup', '$q', '$rootScope', 'NewRotaService', 'ModalSelect', 'RotaSpeciality', 'RotaRole', 'RotaOrganisation');
		$scope = $rootScope.$new();
		controller = $controller('NewRotaStartController', {$scope: $scope});
	});
	
	it('exists', function () {
		expect(controller).toBeDefined();
	});
	
	it('worksInTheNHS defaults to false', function () {
		expect(controller.$worksInTheNHS).toBe(false);
	});
	
	it('workInTheNHS can set $worksInTheNHS to true', function () {
		controller.workInTheNHS();
		expect(controller.$worksInTheNHS).toBe(true);
	});
	
	describe('selectNHSData ', function () {
		var modalReturnValue;
		
		function getCallObj() {
			return ModalSelect.show.calls.first().args[0];
		}
		
		beforeEach(function () {
			
			modalReturnValue = null;
			
			spyOn(ModalSelect, 'show').and.callFake(function (options) {
				$q.when().then(function () {
					options.callback(modalReturnValue);
				})
			});
			
			spyOn(RotaSpeciality, '$find').and.returnValue($q.when([]));
			spyOn(RotaRole, '$find').and.returnValue($q.when([]));
			spyOn(RotaOrganisation, '$find').and.returnValue($q.when([]));
			
		});
		it('triggers ModalSelect.show', function () {
			controller.selectNHSData('role');
			expect(ModalSelect.show).toHaveBeenCalled();
		});
		it('passes role data when passed role', function () {
			controller.selectNHSData('role');
			expect(RotaRole.$find).toHaveBeenCalled();
			
			//extract the call and interrogate
			var obj = getCallObj();
			expect(obj.title).toBe('Select Role');
			expect(obj.nameKey).toBe('title');
			
		});
		it('passes organisational data when passed organisation', function () {
			controller.selectNHSData('organisation');
			expect(RotaOrganisation.$find).toHaveBeenCalled();
			
			//extract the call and interrogate
			var obj = getCallObj();
			expect(obj.title).toBe('Select Organisation');
			expect(obj.nameKey).toBe('name');
		});
		it('passes speciality data when passed speciality', function () {
			controller.selectNHSData('speciality');
			expect(RotaSpeciality.$find).toHaveBeenCalled();
			
			//extract the call and interrogate
			var obj = getCallObj();
			expect(obj.title).toBe('Select Speciality');
			expect(obj.nameKey).toBe('title');
		});
		
		it('passes the returned value and correct key to the callback', function () {
			modalReturnValue = '12345';
			controller.selectNHSData('role');
			spyOn(controller, 'selectNHSDataCallback');
			
			$rootScope.$apply();//flush the promise
			
			expect(controller.selectNHSDataCallback).toHaveBeenCalledWith(
				'role', modalReturnValue
			);
		});
		
		it('selectNHSDataCallback can set the returned value and fetch the object', function () {
			
			spyOn(controller, 'updateViewWithRelatedModel');
			controller.selectNHSDataCallback('role', 'test');
			expect(controller.rota.role).toBe('test');
			expect(controller.updateViewWithRelatedModel).toHaveBeenCalledWith('role');
		});
	});
	
	it('getRelatedObject can find the related object', function () {
		var returnedRole = RotaRole.create();
		spyOn(controller.rota, '$getRel').and.returnValue(
			$q.when(returnedRole)
		);
		
		controller.rota.role = 10;
		controller.updateViewWithRelatedModel('role');
		
		$rootScope.$apply();
		
		expect(controller.rota.$getRel).toHaveBeenCalledWith('role');
		expect(controller.fields['role'].selected).toBe(returnedRole);
		
	});
	
	it('Attempt proceed will display an error if no rota label', function () {
		spyOn(controller, 'showValidationError').and.returnValue($q.when());
		controller.attemptProceed();
		expect(controller.showValidationError).toHaveBeenCalled();
	});
	
	it('Attempt proceed will call rota service.next if rota label is set', function () {
		spyOn(NewRotaService, 'next');
		
		controller.rota.label = 'test';
		controller.attemptProceed();
		
		expect(NewRotaService.next).toHaveBeenCalled();
	});
	
	describe('attemptProceed calls showValidationError', function () {
		beforeEach(function () {
			spyOn(controller, 'showValidationError').and.returnValue($q.when());
		});
		
		it('label / organisation / speciality / role', function () {
			controller.attemptProceed(true);
			expect(controller.showValidationError).toHaveBeenCalledWith([
				'label', 'role', 'speciality', 'organisation'
			]);
		});
		
		it('organisation / speciality / role', function () {
			controller.rota.label = 'test';
			controller.attemptProceed(true);
			expect(controller.showValidationError).toHaveBeenCalledWith([
				'role', 'speciality', 'organisation'
			]);
			
		});
		it('role only', function () {
			controller.rota.label = 'test';
			controller.rota.organisation = 'test';
			controller.rota.speciality = 'test';
			controller.attemptProceed(true);
			expect(controller.showValidationError).toHaveBeenCalledWith([
				'role'
			]);
		});
		it('speciality only', function () {
			controller.rota.label = 'test';
			controller.rota.organisation = 'test';
			controller.rota.role = 'test';
			controller.attemptProceed(true);
			expect(controller.showValidationError).toHaveBeenCalledWith([
				'speciality'
			]);
		});
		it('organisation only', function () {
			controller.rota.label = 'test';
			controller.rota.role = 'test';
			controller.rota.speciality = 'test';
			controller.attemptProceed(true);
			expect(controller.showValidationError).toHaveBeenCalledWith([
				'organisation'
			]);
		});
		
		it('if shouldValidateNHSFields=false then only returns label', function () {
			controller.attemptProceed(false);
			expect(controller.showValidationError).toHaveBeenCalledWith([
				'label'
			]);
		});
	});
	
	it('attemptProceed will call rota service.next if label validates and passed false', function () {
		spyOn(NewRotaService, 'next');
		
		controller.rota.label = 'test';
		controller.attemptProceed(false);
		
		expect(NewRotaService.next).toHaveBeenCalled();
	});
	
	it('attemptProceed will call rota service.next if rota label and NHS fields are set when asked specifically', function () {
		spyOn(NewRotaService, 'next');
		
		controller.rota.label = 'test';
		controller.rota.role = 'test';
		controller.rota.organisation = 'test';
		controller.rota.speciality = 'test';
		controller.attemptProceed(true);
		
		expect(NewRotaService.next).toHaveBeenCalled();
	});
	
	describe('formatValidationError', function () {
		it('returns Name is a required field when passed [label]', function () {
			expect(controller.formatValidationError(['label']))
				.toBe('Name is a required field');
		});
		it('returns Name and Role are required fields when passed [label,role]', function () {
			expect(controller.formatValidationError(['label', 'role']))
				.toBe('Name and Role are required fields');
		});
		it('returns Name, Role and Organisation are required fields when passed [label,role,organisation]', function () {
			expect(controller.formatValidationError(['label', 'role', 'organisation']))
				.toBe('Name, Role and Organisation are required fields');
		});
	});
	
	
});