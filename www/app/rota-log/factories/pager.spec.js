describe('saferota.rota-log Pager', function () {
	var collection,
		pager;
	beforeEach(function () {
		bard.appModule('saferota.rota-log');
		bard.inject(['Pager', 'OrderedCollection']);
		
		collection = new OrderedCollection(OrderedCollection.default);
		collection.add([1, 2, 3, 4, 5]);
		
		pager = new Pager(collection, {limit: 2});
		
	});
	
	it('exists', function () {
		expect(Pager).toBeDefined();
	});
	
	it('loads a page when created if data', function () {
		expect(pager.data.length).toBe(2);
		expect(pager.data[0]).toBe(1);
		expect(pager.data[1]).toBe(2);
	});
	it('nextPage loads the next page', function () {
		pager.nextPage();
		expect(pager.data.length).toBe(4);
		
		expect(pager.data[0]).toBe(1);
		expect(pager.data[1]).toBe(2);
		expect(pager.data[2]).toBe(3);
		expect(pager.data[3]).toBe(4);
	});
	it('nextPage can handle when none left', function () {
		pager.nextPage();
		pager.nextPage();
		pager.nextPage();
		pager.nextPage();
		expect(pager.data.length).toBe(5);
	});
	
	it('.$more is true if there are more pages available', function () {
		expect(pager.$more).toBe(true);
	});
	it('.$more is false if there are no more pages available', function () {
		pager.nextPage();
		expect(pager.$more).toBe(true);
		pager.nextPage();
		expect(pager.$more).toBe(false);
	});
	
	it('.refresh clears the pagination and starts again', function () {
		pager.nextPage();
		pager.refresh();
		expect(pager.data.length).toBe(2);
		expect(pager.data[0]).toBe(1);
		expect(pager.data[1]).toBe(2);
	});
	
	it('.reload clears the data out and refreshes to the same page', function () {
		pager.nextPage();
		collection.remove(2);
		pager.reload();
		expect(pager.data.length).toBe(4);
		expect(pager.data[0]).toBe(1);
		expect(pager.data[1]).toBe(2);
		expect(pager.data[2]).toBe(4);
		expect(pager.data[3]).toBe(5);
	});
	
	
});