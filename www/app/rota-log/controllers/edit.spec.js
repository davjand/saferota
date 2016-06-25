describe('saferota.rota-log RotaLogEditController', function () {
	
	var controller, $scope, timespan, now;
	
	beforeEach(function () {
		bard.appModule('saferota.rota-log');
		module('allTemplates');
		bard.inject('$controller', '$rootScope', '$cordovaDatePicker', '$q', 'RotaTimespan', 'moment');
		$scope = $rootScope.$new();
		
		now = Date.now();
		
		timespan = RotaTimespan.create({
			enter:           moment(now).valueOf(),
			exit:            moment(now).add(6, 'hours').valueOf(),
			rota:            'rota1',
			location:        'location1',
			unresolvedError: false
		});
		timespan.calculateDuration();
		
		controller = $controller('RotaLogEditController', {
			$scope:          $scope,
			currentTimespan: timespan
		});
		
		//Mock ngCordova
		$cordovaDatePicker.show = function () {
			return $q.when();
		};
		
	});
	
	describe('activate', function () {
		it('exists', function () {
			expect(controller).toBeDefined();
		});
		it('sets the timespan to be the resolved timespan', function () {
			expect(controller.timespan).toBe(timespan);
		});
	});
	
	describe('editEnterDate', function () {
		var calledWith, returnedByDatePicker;
		
		beforeEach(function () {
			returnedByDatePicker = moment(now).add(3, 'hours');
			
			spyOn($cordovaDatePicker, 'show').and.callFake(function () {
				return $q.when(returnedByDatePicker)
			});
			
			controller.editEnterDate();
			calledWith = $cordovaDatePicker.show.calls.mostRecent().args[0];
		});
		it('should call the date service', function () {
			expect($cordovaDatePicker.show).toHaveBeenCalled();
		});
		it('should pass the enter date', function () {
			expect(calledWith.mode).toEqual('date');
			expect(calledWith.date).toEqual(timespan.enter);
		});
		it('should set the enter time based on the result', function () {
			$rootScope.$apply();
			expect(controller.timespan.enter).toBe(returnedByDatePicker);
		});
		it('should calculate the duration', function () {
			$rootScope.$apply();
			expect(controller.timespan.duration).toBe(180);
		});
	});
	
	
	describe('handleEnterDateChange ', function () {
		it('If after the leave date, adjusts the exit date to keep the duration constant', function () {
			var date = moment(timespan.exit).add(1, 'days').valueOf();
			controller.handleEnterDateChange(date);
			
			expect(moment(controller.timespan.enter)).toEqual(moment(date));
			
			expect(moment(controller.timespan.exit).valueOf())
				.toEqual(moment(date).add(6, 'hours').valueOf());
		});
	});
	
	describe('editEnterTime', function () {
		var calledWith;
		beforeEach(function () {
			spyOn($cordovaDatePicker, 'show').and.returnValue($q.when());
			controller.editEnterTime();
			calledWith = $cordovaDatePicker.show.calls.mostRecent().args[0];
		});
		
		it('datepicker.show should have been called', function () {
			expect($cordovaDatePicker.show).toHaveBeenCalled();
		});
		it('is called with date and time mode', function () {
			expect(calledWith.mode).toBe('time');
			expect(calledWith.date).toBe(timespan.enter);
		});
	});
	
	describe('editExitDate', function () {
		var calledWith;
		beforeEach(function () {
			spyOn($cordovaDatePicker, 'show').and.returnValue($q.when());
			controller.editExitDate();
			calledWith = $cordovaDatePicker.show.calls.mostRecent().args[0];
		});
		it('datepicker.show should have been called', function () {
			expect($cordovaDatePicker.show).toHaveBeenCalled();
		});
		it('should set the minDate to the enter date', function () {
			expect(calledWith.minDate).toBe(timespan.enter);
		});
		it('should pass the exit date', function () {
			expect(calledWith.date).toBe(timespan.exit);
		});
		it('should set the mode to date', function () {
			expect(calledWith.mode).toBe('date');
		});
	});
	
	describe('editExitTime', function () {
		var calledWith;
		beforeEach(function () {
			spyOn($cordovaDatePicker, 'show').and.returnValue($q.when());
			controller.editExitTime();
			calledWith = $cordovaDatePicker.show.calls.mostRecent().args[0];
		});
		it('datepicker.show should have been called', function () {
			expect($cordovaDatePicker.show).toHaveBeenCalled();
		});
		it('should set the minDate to the enter date', function () {
			expect(calledWith.minDate).toBe(timespan.enter);
		});
		it('should pass the exit date', function () {
			expect(calledWith.date).toBe(timespan.exit);
		});
		it('should set the mode to date', function () {
			expect(calledWith.mode).toBe('time');
		});
	});
	
	describe('handleExitDateChange', function () {
		it('should edit the exit date and adjust the duration', function () {
			var date = moment(timespan.exit).subtract(1, 'hour').valueOf();
			controller.handleExitDateChange(date);
			
			expect(moment(controller.timespan.exit)).toEqual(moment(date));
			expect(controller.timespan.duration).toEqual(300);
		});
		
		it('If before the enter date, adjusts the enter date to keep the duration constant', function () {
			var date = moment(timespan.enter).subtract(1, 'days').valueOf();
			controller.handleExitDateChange(date);
			
			expect(moment(controller.timespan.exit)).toEqual(moment(date));
			
			expect(moment(controller.timespan.enter).valueOf())
				.toEqual(moment(date).subtract(6, 'hours').valueOf());
		});
	});
	
	
});