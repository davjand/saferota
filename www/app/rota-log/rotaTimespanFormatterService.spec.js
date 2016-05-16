describe('saferota.rota-log RotaTimeSpanFormatterService', function () {
	beforeEach(module('saferota.rota-log'));

	var RotaTimespanFormatterService, formatHoursMinutesFilter,
		Rota, RotaLocation, RotaTimespan, DataStore, RequestService,
		$q, $rootScope, moment;

	var aLocation,
		aRota;


	beforeEach(inject(function (_RotaTimespanFormatterService_,
								_formatHoursMinutesFilter_,
								_Rota_,
								_RotaLocation_,
								_RotaEvent_,
								_RotaTimespan_,
								_$q_,
								_$rootScope_,
								_DataStore_,
								_RequestService_,
								_moment_) {

		RotaTimespanFormatterService = _RotaTimespanFormatterService_;
		formatHoursMinutesFilter = _formatHoursMinutesFilter_;

		Rota = _Rota_;
		RotaLocation = _RotaLocation_;
		RotaTimespan = _RotaTimespan_;
		$q = _$q_;
		$rootScope = _$rootScope_;
		DataStore = _DataStore_;
		RequestService = _RequestService_;
		moment = _moment_;


		DataStore.$alwaysSearchLocal = true;
		RequestService.$disableBackgroundQueueProcessing = true;

		//sample data
		aLocation = RotaLocation.create({
			objectId: 'loc1',
			rota: 'rota1'
		});


	}));

	function _d() {
		$rootScope.$digest();
	}

	/*
	 * helper function to setup the data
	 * Easier to do per unit test than in before due to digest issues
	 *
	 */
	function _up() {
		return DataStore.clearAll().then(function () {
			return DataStore.save([aRota, aLocation]);
		});
	}


	it('Can build a set of date groupings from a start date, end date', function () {
		var d = RotaTimespanFormatterService.buildGrouping(
			moment('2016-03-01 08:00:00.000').valueOf(), //start
			moment('2016-05-01 08:00:00.000').valueOf() //end
		);

		expect(d.length).toBe(9); //should be 9 weeks
		expect(d[0].start).toEqual(moment('2016-02-29 00:00:00.000').valueOf());
		expect(d[0].end).toEqual(moment('2016-03-06 23:59:59.999').valueOf());

		expect(d[8].start).toEqual(moment('2016-04-25 00:00:00.000').valueOf());
		expect(d[8].end).toEqual(moment('2016-05-01 23:59:59.999').valueOf());
	});

	it('.groupByWeek can group timespans by week', function () {
		var ts = [
			RotaTimespan.create({
				objectId: '1',
				location: 'loc1',
				enter: moment('2016-05-04 08:00:00.000').valueOf(), //4th May
				exit: moment('2016-05-04 12:00:00.000').valueOf(),
				duration: 4 * 60
			}),
			RotaTimespan.create({
				objectId: '2',
				location: 'loc1',
				enter: moment('2016-04-04 08:00:00.000').valueOf(), // 4th April
				exit: moment('2016-04-04 12:00:00.000').valueOf(),
				duration: 4 * 60
			}),
			RotaTimespan.create({
				objectId: '3',
				location: 'loc1',
				enter: moment('2016-03-18 08:00:00.000').valueOf(), // 18th March
				exit: moment('2016-03-18 12:00:00.000').valueOf(),
				duration: 4 * 60
			}),
			RotaTimespan.create({
				objectId: '4',
				location: 'loc1',
				enter: moment('2016-04-08 08:00:00.000').valueOf(), // 8th April
				exit: moment('2016-04-08 12:00:00.000').valueOf(),
				duration: 4 * 60
			})
		];

		var g = RotaTimespanFormatterService.groupByWeek(ts);

		expect(g.length).toBe(8);
		expect(g[0].items.length).toBe(1);
		expect(g[0].items[0].getKey()).toBe('3');

		expect(g[1].items.length).toBe(0);

		expect(g[3].items.length).toBe(2);
		expect(g[3].items[0].getKey()).toBe('2');
		expect(g[3].items[1].getKey()).toBe('4');

		expect(g[4].items.length).toBe(0);

		expect(g[7].items.length).toBe(1);
		expect(g[7].items[0].getKey()).toBe('1');

	});

	it('formatHoursMinutes filter', function () {
		var f = formatHoursMinutesFilter;

		expect(f(0)).toEqual("0<span>m</span>");
		expect(f(30)).toEqual("30<span>m</span>");
		expect(f(60)).toEqual("1<span>h</span>");
		expect(f(75)).toEqual("1<span>h</span>15<span>m</span>");
		expect(f(120)).toEqual("2<span>h</span>");
		expect(f(200)).toEqual("3<span>h</span>20<span>m</span>");
	});
});