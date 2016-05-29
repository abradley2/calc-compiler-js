var grammar = require('./grammar'),
    Tokenizer = require('./Tokenizer'),
    TreeParser = require('./TreeParser'),
    assign = require('./util/assign')

function Compiler () {

    this.tokenizer = new Tokenizer( grammar )

    this.treeParser = new TreeParser()

}

assign(Compiler.prototype, {

    compileTemplate: function (template) {

        var tokens = this.tokenizer.getTokens(template),
            ast = tree(tokens)

    }

})



module.exports = compiler
