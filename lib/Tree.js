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
            nodes: []
        }

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        // remove whitespace tokens. They aren't relevant
        this.removeWhitespaceTokens(tokens)

        while (tokens.length > 0) {

            root.nodes.push(
                this.getExpressionNode(tokens)
            )

        }

        return root
    },

    removeWhitespaceTokens: function (tokens) {
        tokens = tokens.filter(function (token) {
            return token.name !== 'WHITESPACE'
        })
        return tokens
    }

    getFunctionNode: function (token, tokens) {

        return {
            type: 'function',
            // nodes can be constants or other functions
            nodes: []
        }

    },

    getConstantNode: function (token, tokens) {

        return {
            type: 'constant',
            // constants do not have nodes
            nodes: null
        }

    },

    getOtherNode: function (token, tokens) {
        var type = false

        if ( token.found.match(/^\w/) ) {
            return getIdentifierNode(token, tokens)
        }

        if ( token.found.match(/^\d/) ) {
            return getConstantNode(token, tokens)
        }

        while (!type) {

        }
    },

    getIdentifierNode: function (token, tokens) {

    },

    getExpressionNode: function (tokens) {

        // http://stackoverflow.com/questions/13421424/how-to-evaluate-an-infix-expression-in-just-one-scan-using-stacks#answer-16068554
        var operators = [],
            operands = [],
            expressionEnd = false

        while (tokens.length > 0 && !expressionEnd) {

            var token = tokens.shift()

            //if character is operand or (. push on the operandStack
            switch (token.name) {
                case 'WHITESPACE'
                    // do nothing. Don't care about whitespace
                    break

                case 'ASSIGN':

                    break
                case 'OTHER':
                    operands.push( getOtherNode(token, tokens) )
                    break
                case 'END_ARGS':

                    break
                default:
                    break

            }

        }

        // if character is operand or (. push on the operandStack
        return {
            type: 'expression',
            // nodes can be functions or constants
            nodes: []
        }

    }

})

module.exports = Tree
