var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    Tree = require('./Tree'),
    func = require('./func'),
    assign = require('./util/assign')

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

}

assign(Compiler.prototype, {

    compileTemplate: function (template) {

        var tokens = this.tokenizer.getTokens(template)

        var tree = new Tree(tokens)

        var nodes = tree.parse()

        /*
            now use the functions in /func
            to sub in for function nodes and
            create a working expression
        */

        console.log('nodes = ',JSON.stringify(nodes))

        /*
            Finally, return the output function
        */
        return function (item) {
            return item
        }

    }

})

module.exports = Compiler
