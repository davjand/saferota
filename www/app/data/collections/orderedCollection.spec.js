describe('saferota.data OrderedCollection', function () {
	var collection;
	beforeEach(function () {
		bard.appModule('saferota.data');
		bard.inject('OrderedCollection');
		
		collection = new OrderedCollection(function (item) {
			return item;
		});
		
	});
	
	it('exists', function () {
		expect(OrderedCollection).toBeDefined();
	});
	
	it('Can add an item to the collection', function () {
		collection.add("test", "index");
		expect(collection.length()).toBe(1);
	});
	it('add can accept an array', function () {
		collection.setComparator(function (item) {
			return item.name;
		});
		collection.add([
			{name: 'andy'},
			{name: 'bob'},
			{name: 'paul'}
		]);
		
		expect(collection.get(0).name).toEqual('andy');
		expect(collection.get(2).name).toEqual('paul');
		expect(collection.length()).toBe(3);
	});
	
	it('.add orders item according to the comparator', function () {
		collection.setComparator(function (item) {
			return item.name;
		});
		
		collection.add([
			{name: 'bob'},
			{name: 'paul'},
			{name: 'andy'}
		]);
		
		expect(collection.get(0).name).toEqual('andy');
		expect(collection.get(1).name).toEqual('bob');
		expect(collection.get(2).name).toEqual('paul');
	});
	
	
	it('Can get an item from the collection', function () {
		collection.add("test");
		expect(collection.get(0)).toBe("test");
	});
	it('.remove deletes the item at the passed index', function () {
		collection.add(["test", "index"]);
		expect(collection.length()).toBe(2);
		collection.remove(0);
		expect(collection.length()).toBe(1);
	});
	
	it('.remove can delete the second place', function () {
		collection.add(["test", "test2", 'test3']);
		collection.remove(1);
		expect(collection.length()).toBe(2);
		expect(collection._items[0]).toBe("test");
		expect(collection._items[1]).toBe("test3");
	});

	
	describe('items can paginate', function () {
		beforeEach(function () {
			collection.add([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
		});
		it('returns all when passed nothing', function () {
			expect(collection.items().length).toBe(20);
		});
		it('Can return 1 item when passed 0,1', function () {
			expect(collection.items(0, 1)[0]).toBe(1);
			expect(collection.items(0, 1).length).toBe(1);
		});
		it('Only returns the maxium length if asked for more', function () {
			expect(collection.items(10, 50).length).toBe(10);
		});
		it('returns an empty array if start is > length', function () {
			expect(collection.items(50)).toEqual([]);
		});
	});
	
	
	describe('accessing data', function () {
		var item1, item2, item3, item4, item5;
		beforeEach(function () {
			
			item1 = {name: 'james', age: 10};
			item2 = {name: 'john', age: 50};
			item3 = {name: 'paul', age: 30};
			item4 = {name: 'steven', age: 40};
			item5 = {name: 'james', age: 50};
			
			collection.add([item1, item2, item3, item4, item5]);
		});
		
		it('.find returns a single item matched by the callback', function () {
			var item = collection.find(function (item) {
				return item.age === 50
			});
			expect(item).toEqual({name: "james", age: 50});
			
		});
		it('find returns null if nothing found', function () {
			var item = collection.find(function (item) {
				return item.name === 'sosos'
			});
			expect(item).toBe(null);
		});
		
		
		it('.filter can return the items matched by the callback', function () {
			var items = collection.filter(function (item) {
				return item.name === 'james'
			});
			expect(items.length).toBe(2);
			
		});
		it('find returns []] if nothing found', function () {
			var item = collection.filter(function (item) {
				return item.name === 'sosos'
			});
			expect(item).toEqual([]);
		});
		
		it('getIndex returns -1 if not found', function () {
			expect(collection.indexOf({test: 'item'})).toBe(-1);
		});
		it('getIndex returns the index of the item', function () {
			expect(collection.indexOf(item3)).toBe(2);
		});

	});
	
});