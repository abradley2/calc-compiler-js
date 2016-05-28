var grammar = require('./grammar'),
    delimiters = require('./configure/delimiters'),
    tokenize = require('./tokenize'),
    tree = require('./tree'),
    assign = require('./util/assign')

var compiler = function (settings) {
    settings = settings || {}

    // allow adding custom delimiters. Keep ones that aren't overriden
    this.delimiters = assign(delimiters, settings.delimiters || {})

    this.grammar = grammar( this.delimiters )

}

compiler.prototype.compileTemplate = function (template) {

    var tokens = tokenize(template, this.grammar),
        ast = tree(tokens)

}



module.exports = compiler
