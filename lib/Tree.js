var assign = require('./util/assign')

function Tree (tokens) {
    this.tokens = tokens
}

assign(Tree.prototype, {

    parse: function () {

        var root = {
            type: 'Root',
            nodes: []
        }

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        // http://stackoverflow.com/questions/13421424/how-to-evaluate-an-infix-expression-in-just-one-scan-using-stacks#answer-16068554
        var operators = [],
            operands = []

        while (tokens.length > 0) {
            var token = tokens.shift()
            // if character is operand or (. push on the operandStack
            
        }

        console.log('operators = ',operators)
        console.log('operands = ',operands)
    }

})

module.exports = Tree
