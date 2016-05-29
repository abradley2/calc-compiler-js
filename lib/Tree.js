var assign = require('./util/assign')

function Tree (tokens) {
    this.tokens = tokens
}

assign(Tree.prototype, {
    
    /*
        Because of what we are compiling, we have no more than a single
        block of expressions. Makes this task much easier than it would
        be. For future reference should this be expanded to support
        multiple blocks, this function should be renamed to 'parseBlock'
        and called internally from the master 'parse' function
    */
    parse: function () {



        var root = {
            type: 'Root',
            expressions: []
        }

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        while (tokens.length > 0) {

            root.push(
                this.getExpressionNode(tokens)
            )

        }

        console.log('operators = ',operators)
        console.log('operands = ',operands)
    },

    getExpressionNode: function (tokens) {

        // http://stackoverflow.com/questions/13421424/how-to-evaluate-an-infix-expression-in-just-one-scan-using-stacks#answer-16068554
        var operators = [],
            operands = []

        return {
            // assignment,
            type: ''
        }

    }

})

module.exports = Tree
