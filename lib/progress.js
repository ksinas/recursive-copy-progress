"use strict"

const EventEmitter = require('events'),
    pgstr = require('progress-stream'),
    extend = require('extend')

class CopyProgress extends EventEmitter {

    constructor (options) {
        super()
        this.options = { interval: 100 }
        if (typeof options === 'object' && options.interval) {
            this.options.interval = options.interval
        }
        this.length = 0
        this.transferred = 0
        this.percentage = 0
        this.tasks = []
        this.nextTick = Date.now()
    }

    setLength(l) {
        this.length = l
    }

    addLength(dl) {
        this.length += dl
    }

    registerTask(stats) {
        this.addLength(stats.size)
        let str = pgstr({
            length: stats.size,
            time: this.options.interval
        })
        let update = {
            percentage: 0,
            transferred: 0,
            length: stats.size,
            remaining: stats.size,
            eta: 0,
            runtime: 0,
            delta: 0,
            speed: 0
        }
        this.tasks.push(update)
        str.on('progress', (upd) => {
            extend(update, upd)
            this.transferred += upd.delta
            this.percentage = this.transferred / this.length * 100
            if (Date.now() > this.nextTick || this.percentage == 100) {
                this.nextTick = Date.now() + this.options.interval
                this.emit('progress', extend({}, this))
            }
        })
        return str
    }
}

module.exports = function (options) {
    return new CopyProgress(options)
}