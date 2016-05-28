var compiler = require('./lib/compiler'),
    c = new compiler()


var testTemplate = 'COL_3 = ADD(COL_1 , 7)'

c.compileTemplate( testTemplate )

module.exports = compiler
