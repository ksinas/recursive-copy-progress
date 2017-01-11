"use strict"

const copy = require('recursive-copy')
const through2 = require('through2')

module.exports = function (source, destination, options, cb) {
    if (typeof options === 'function') return module.exports(source, destination, null, options)
    options = options || {}
    const progress = require('./progress')(options)

    let _transform = options.transform

    options.transform = function (src, dest, stats) {
        let str = progress.registerTask(stats)
        if (_transform) {
            let tstr = _transform(src, dest, stats)
            if (tstr) {
                // if there is another stream provided, we have to pipe it in the same chain
                var outstream = through2().on('pipe', function(source) {
                    source.unpipe(this)
                    this.transformStream = source.pipe(str).pipe(tstr)
                });
                outstream.pipe = function(destination, options) {
                    return this.transformStream.pipe(destination, options)
                }
                return outstream
            } else {
                return str
            }
        } else {
            return str
        }
    }

    let emitter = copy(source, destination, options, cb)
    progress.on('progress', function (update) {
        emitter.emit('progress', update)
    })
    return emitter
}