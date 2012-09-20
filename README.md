node-dank-amap
--------------

An asynchronous map function which can map over anything for node.

Similar feature set as [node-dank-map](https://github.com/wankdanker/node-dank-map)

example
-------

```javascript
amap = require('dank-amap');

amap([5,2,4,5], function (key, val, next, emit, end) {
	if (val === 5) {
		return next();
	}
	else {
		return next(null, val);
	}
}, function (err, result) {
	console.log(result);
}, true);

```

See also test.js
