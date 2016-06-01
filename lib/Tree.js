var assign = require('./util/assign'),
    last = require('./util/last')

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

    /*
        function for removing all whitespace token
    */
    removeWhitespaceTokens: function (tokens) {
        tokens = tokens.filter(function (token) {
            return token.name !== 'WHITESPACE'
        })
        return tokens
    },


    getExpressionNode: function (tokens) {

        //http://csis.pace.edu/~murthy/ProgrammingProblems/16_Evaluation_of_infix_expressions
        var stack = [],
            output = []

        while (tokens.length > 0) {

            var token = tokens.shift(),
                next = tokens[0]

            //if character is operand or (. push on the operandStack
            switch (token.name) {
                case 'OTHER':
                    if (token.found.match(/^\d/)) {
                        output.push({
                            type: 'num',
                            found: token.found
                        })
                    } else if (next && next.name === 'BEG_ARGS') {
                        stack.push({
                            type: 'func',
                            found: token.found
                        })
                    } else {

                        operands.push({
                            type: 'const',
                            content: token.found
                        })

                    } 

                    break

                case 'BEG_ARGS':

                    operators.push({
                        type: 'open',
                        precedence: 3,
                        content: token.found
                    })

                    break

                case 'ARG_SEP':

                    break

                case 'OPERATOR':
                    var precedence
                    if (token.found === '*' || token.found === '/') {
                        precedence = 2
                    } 
                    if (token.found === '+' || token.found === '-') {
                        precedence = 1
                    }
                    operators.push({
                        type: 'operator',
                        precedence: precedence,
                        content: token.found
                    })
                    break
                case 'END_ARGS':
                    proc()
                    break
                default:
                    proc()
                    break

            }

        }

        return operands

    }

})

module.exports = Tree
