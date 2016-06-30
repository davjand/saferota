(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('TimespanIssuesService', TimespanIssuesService);
	
	TimespanIssuesService.$inject = [
		'RotaTimespan',
		'ModelStream',
		'$q',
		'$state',
		'$ionicPopup',
		'$rootScope',
		'DATA_EVENTS'];
	
	/* @ngInject */
	function TimespanIssuesService(RotaTimespan,
								   ModelStream,
								   $q,
								   $state,
								   $ionicPopup,
								   $rootScope,
								   DATA_EVENTS) {
		var self = this;
		
		self.activate = activate;
		self.resetDataStream = resetDataStream;
		self.setRota = setRota;
		self.areIssues = areIssues;
		self.count = count;
		
		self.remove = remove;
		self.approve = approve;
		self.amend = amend;
		
		activate();
		
		return self;
		
		
		/////////////////////////////////////////////
		
		
		/**
		 *
		 * activate
		 *
		 */
		function activate() {
			$rootScope.$on(DATA_EVENTS.SYNC_FINISH, function () {
				self.resetDataStream();
			});
			
			self.resetDataStream();
		}
		
		/**
		 *
		 * reset the datastream
		 *
		 */
		function resetDataStream() {
			self.issues = [];
			
			var query = {unresolvedError: true};
			if (self._rotaKey) {
				query.rota = self._rotaKey;
			}
			
			self.issues = new ModelStream(RotaTimespan, query, function (item) {
				return item.enter
			}, -1);
		}
		
		/**
		 * setRota
		 *
		 * @param rota
		 */
		function setRota(rota) {
			if (self.issues) {
				self.issues.destroy();
			}
			self._rotaKey = rota.getKey();
			self.resetDataStream();
		}
		
		/**
		 * count the issues
		 *
		 * @returns {*}
		 */
		function count() {
			if (!self.issues) {
				return 0;
			}
			return self.issues.items.length();
		}
		
		/**
		 * returns true if there are issues
		 *
		 * @returns {boolean}
		 */
		function areIssues() {
			return self.issues.items.length() > 0;
		}
		
		/**
		 * resolve an issue by deleting it
		 * @param timespan
		 */
		function remove(timespan) {
			
			return $ionicPopup.confirm({
				title:    'Are You Sure?',
				subTitle: "You will not be able to undo this",
				okType:   'button-assertive'
			}).then(function (ok) {
				if (ok) {
					timespan.unresolvedError = false;
					timespan.deleted = true;
					return timespan.$save();
				}
				return $q.when();
			})
			
			
		}
		
		/**
		 *
		 * approve a timespan
		 *
		 * @param timespan
		 */
		function approve(timespan) {
			timespan.unresolvedError = false;
			return timespan.$save();
		}
		
		/**
		 * ammend a timespan
		 *
		 * @param timespan
		 */
		function amend(timespan) {
			$state.go('app.view.logs-edit', {timespanId: timespan.getKey()});
		}
	}
	
})();

