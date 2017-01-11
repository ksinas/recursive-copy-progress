'use strict';

var fs = require('fs');
var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var del = require('del');

var copy = require('../../lib/copy');

var SOURCE_PATH = path.resolve(__dirname, '../fixtures/source');
var DESTINATION_PATH = path.resolve(__dirname, '../fixtures/destination');

describe('copy()', function() {
	beforeEach(function(done) {
		fs.mkdir(DESTINATION_PATH, function(error) {
			if (error) {
				del(path.join(DESTINATION_PATH, '**/*'), {
					dot: true,
					force: true
				}, done);
			} else {
				done();
			}
		});
	});

	afterEach(function() {
		return del(DESTINATION_PATH, {
			dot: true,
			force: true
		});
	});

	it('should emit progress multiple times, when interval is frequent', function (done) {
		var times = 0
		copy(SOURCE_PATH, DESTINATION_PATH, {interval:1}, function (err) {
			try {
				expect(times).not.to.eql(0);
				done()
			} catch (err) {
				done(err)
			}
		}).on('progress', function (pg) {
			times++
		})
	})
	it('should emit progress only 2 times, when interval is longer than copy process', function (done) {
		var times = 0
		copy(SOURCE_PATH, DESTINATION_PATH, {interval:10000}, function (err) {
			try {
				expect(times).to.eql(2);
				done()
			} catch (err) {
				done(err)
			}
		}).on('progress', function (pg) {
			times++
		})
	})
	it('should emit progress without option parameters', function (done) {
		var times = 0
		copy(SOURCE_PATH, DESTINATION_PATH, function (err) {
			try {
				expect(times).to.be.greaterThan(1)
				done()
			} catch (err) {
				done(err)
			}
		}).on('progress', function (pg) {
			times++
		})
	})
	it('should pipe options.transform function', function (done) {
		var times1 = 0
		var times2 = 0

		var percentage1 = 0
		var percentage2 = 0

		var progress = require('../../lib/progress')({interval:10})


		var transform = function (src, dest, stats) {
			return progress.registerTask(stats)
		}

		progress.on('progress', function (pg) {
			percentage2 = pg.percentage
			times2++
		})

		copy(SOURCE_PATH, DESTINATION_PATH, {interval:10, transform:transform}, function (err) {
			try {
				expect(times1).to.be.greaterThan(1)
				expect(times2).to.be.greaterThan(1)
				expect(percentage1).to.eql(100)
				expect(percentage2).to.eql(100)

				expect(times2).to.eql(times1)
				done()
			} catch (err) {
				done(err)
			}
		}).on('progress', function (pg) {
			percentage1 = pg.percentage
			times1++
		})
	})

	it('should pipe options.transform function with different timout', function (done) {
		var times1 = 0
		var times2 = 0

		var progress = require('../../lib/progress')({interval:10})


		var transform = function (src, dest, stats) {
			return progress.registerTask(stats)
		}

		progress.on('progress', function (pg) {
			times2++
		})

		copy(SOURCE_PATH, DESTINATION_PATH, {interval:1, transform:transform}, function (err) {
			try {
				expect(times1).to.be.greaterThan(1)
				expect(times2).to.be.greaterThan(1)
				expect(times2).not.to.eql(times1)
				done()
			} catch (err) {
				done(err)
			}
		}).on('progress', function (pg) {
			times1++
		})
	})

	it('should not pipe if transform function returns null', function (done) {
		var times = 0

		var transform = function (src, dest, stats) {
			return null
		}

		copy(SOURCE_PATH, DESTINATION_PATH, {interval:1, transform:transform}, function (err) {
			try {
				expect(times).to.be.greaterThan(1)
				done()
			} catch (err) {
				done(err)
			}
		}).on('progress', function (pg) {
			times++
		})
	})
});
