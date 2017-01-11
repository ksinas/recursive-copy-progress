# Recursive copy with progress emitter
**Install**
`npm install --save recursive-copy-progress`

Usage
-----
```javascript
const copy = require('recursive-copy-progress')

copy(src, dest, [options, ] callback)
    .on('progress', (update) => {
        console.log('update', update)
    })
```
Options:
supports all the options from original `recursive-copy` package, plus:
* interval (int): sets the rate of progress emitter. Default is `100`ms
