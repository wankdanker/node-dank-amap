var rateLimit = require('function-rate-limit');

module.exports = mapAsync;

function mapAsync(obj, fn, done, sq, conc) {
	var a = []
		, fifo = []
		, key
		, keys
		, iterate
		, options
		, startTime
		, doneCalled = false
		, doCall
		, callCount = 0
		, limitCount = 0
		, limitInterval = 0
		, countReturned = 0
		, countRequired = 0
		, concurrent = (!isNaN(sq))
			? sq
			: conc || 1
		, squash = (typeof sq !== 'boolean')
			? false
			: sq
		;
	
	if (typeof arguments[3] === 'object') {
		options = arguments[3];
		
		if (options.hasOwnProperty('squash')) {
			squash = options.squash;
		}
		
		if (options.hasOwnProperty('concurrent')) {
			concurrent = options.concurrent;
		}
		
		if (options.hasOwnProperty('limit')) {
			if (typeof options.limit === 'object') {
				limitCount = options.limit.count || 1; //default to 1 iteration
				limitInterval = options.limit.interval || 1000; //default to per second
			}
			else {
				limitCount = options.limit;
				limitInterval = 1000; //default to per second
			}
		}
	}
	
	if (typeof(fn) !== 'function') {
		throw new Error("mapAsync requires a callback function to execute on each element.");
	}
		
	if (typeof(done) !== 'function') {
		throw new Error("mapAsync requires a callback function to be called when all elements are processed.");
	}
	
	if (Array.isArray(obj) || typeof(obj) === 'string') {
		key = -1;
		countRequired = obj.length;
		
		iterate = function () {
			key++;
			
			if (key < obj.length) {
				doCall(key, obj);
			}
			else {
				finish();
			}
		};
	}
	else if (obj !== null && typeof(obj) === 'object') {
		keys = Object.keys(obj);
		key = -1;
		countRequired = keys.length;
		
		iterate = function () {
			key++;
			
			if (key < keys.length) {
				doCall(keys[key], obj);
			}
			else {
				finish();
			}
		};
	}
	else {
		return [];
	}
	
	if (limitCount) {
		doCall = rateLimit(limitCount, limitInterval, doCallTemplate);
	}
	else {
		doCall = doCallTemplate;
	}
	
	for (var x = 0; x < concurrent; x ++ ) {
		iterate();
	}
	
	function doCallTemplate(key, obj) {
		setImmediate(function () {
			fn.call(
				  obj[key]
				, key
				, obj[key]
				, next
				, emit
				, finish
			);

			key = null;
			obj = null;
		});
	}
	
	function emit(t) {
		if ((t !== undefined && t !== null && squash) || !squash) {
			a.push(t);
		}

		t = null;
	}
	
	function next(err, t) {
		countReturned += 1;
		
		if ((t !== undefined && t !== null && squash) || !squash) {
			a.push(t);
		}
		
		if (err && !doneCalled) {
			doneCalled = true;
			done(err, a);
		}
		else {
			iterate();
		}

		err = null
		t = null;
	}
	
	function finish(err) {
		if (countRequired === countReturned) {
			if (!doneCalled) {
				doneCalled = true;
				done(err || null, a);
			}
			
			//prevent mem leaks
			a = null;
			obj = null;
			fn = null;
			done = null;
			squash = null;
			concurrent = null;
			key = null;
			keys = null;
			iterate = null;
			countRequired = null;
			countReturned = null;
			finish = null;
			emit = null;
			next = null;
		}
		else {
			//console.log(countRequired, countReturned);
		}
	}
}
