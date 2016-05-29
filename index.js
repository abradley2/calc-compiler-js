var compiler = require('./lib/compiler'),
    c = new compiler()


var testTemplate = '5 + ADD(COL_1 + 2 , 7) * 3'

c.compileTemplate( testTemplate )

module.exports = compiler
