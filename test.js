var mapAsync = require('./')
	, assert = require('assert')
	;

exports["Array with numeric values"] = function (test) {
	mapAsync([5,2,4,3], function (key, val, next, emit, end) {
		return next(null, [key, val]);
	}, function (err, result) {
		
		test.deepEqual(result, [
			[0, 5]
			, [1, 2]
			, [2, 4]
			, [3, 3]
		], "Fail Test 1");
		
		test.done();
	});
};

exports["Object with key pairs"] = function (test) {
	mapAsync({ a : '1', b : '2', c : '3'}, function (key, val, next, emit, end) {
		return next(null, [key, val]);
	}, function (err, result) {
		
		test.deepEqual(result, [
			[ 'a', '1' ]
			, [ 'b', '2' ]
			, [ 'c', '3' ]
		], "Fail Test 2");
		
		test.done();
	});
};

exports["String test"] = function (test) {
	mapAsync("this is a test", function (key, val, next, emit, end) {
		return next(null, [key, val]);
	}, function (err, result) {
		
		test.deepEqual(result, [ 
			[ 0, 't' ],
			[ 1, 'h' ],
			[ 2, 'i' ],
			[ 3, 's' ],
			[ 4, ' ' ],
			[ 5, 'i' ],
			[ 6, 's' ],
			[ 7, ' ' ],
			[ 8, 'a' ],
			[ 9, ' ' ],
			[ 10, 't' ],
			[ 11, 'e' ],
			[ 12, 's' ],
			[ 13, 't' ] 
		], "Fail string test");
		
		test.done();
	});
};

exports["Error Test"] = function (test) {
	mapAsync("this is a test", function (key, val, next, emit, end) {
		if (key == 0) {
			return next('wtf', null);
		}
	}, function (err, result) {
		
		test.deepEqual(err, 'wtf', "Fail Error Test");
		test.done();
	});
};

exports["Squash test"] = function (test) {
	mapAsync([5,2,4,5], function (key, val, next, emit, end) {
		if (val === 5) {
			return next();
		}
		else {
			return next(null, val);
		}
	}, function (err, result) {
		
		test.deepEqual(result, [2, 4]);
		test.done();
	}, true);
};

exports["Rate Limit - should take 800 ms"] = function (test) {
	var startTime = new Date().getTime();
	
	mapAsync([5,2,4,5], function (key, val, next, emit, end) {
		return next(null, val);
		
	}, function (err, result) {
		test.deepEqual(result, [5,2,4,5]);
		test.equal(Math.round((new Date().getTime() - startTime) / 100), 8);
		
		test.done();
	}, { squash : true, limit : { count : 1, interval : 200 } });
};

exports["Rate Limit - Concurrent - should take 1000 ms"] = function (test) {
	var startTime = new Date().getTime();
	var a = new Array(100);
	var compareResult = [];
	
	for (var x = 0; x < 100; x++) {
		compareResult.push(x);
	}
	
	mapAsync(a, function (key, val, next, emit, end) {
		return next(null, key);
	}, function (err, result) {
		test.deepEqual(result, compareResult);
		test.equal(Math.round((new Date().getTime() - startTime) / 1000), 1);
		
		test.done();
	}, { squash : true, limit : { count : 100, interval : 1000 }, concurrent : 5 });
};
