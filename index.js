var compiler = require('./lib/compiler'),
    c = new compiler()


var testTemplate = 'ADD (((      1 , 2)'

c.compileTemplate( testTemplate )

module.exports = compiler
