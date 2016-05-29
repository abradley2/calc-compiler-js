var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    assign = require('./util/assign')

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    compileTemplate: function (template) {

        var tokens = this.tokenizer.getTokens(template)

        var tree = new Tree(tokens)

        tree.parse()

        return function (item) {
            return item
        }

    }

})

module.exports = Compiler
