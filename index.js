var Compiler = require('./lib/Compiler'),
    c = new Compiler()


var testTemplate = '5 + ADD(COL_1 + 2 , 7) * 3'

c.compileTemplate( testTemplate )

module.exports = Compiler
