describe('saferota.rota-log RotaTimeSpanFormatterService', function () {
	beforeEach(module('saferota.rota-log'));
	
	var formatHoursMinutesFilter;
	
	beforeEach(inject(function (_formatHoursMinutesFilter_) {
		
		formatHoursMinutesFilter = _formatHoursMinutesFilter_;
		
	}));
	
	
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