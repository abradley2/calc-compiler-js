var Compiler = require('./lib/Compiler')

var c = new Compiler()

var test = 'SUM("one", 1)'

var stack = c.parse(test)

module.exports = Compiler
