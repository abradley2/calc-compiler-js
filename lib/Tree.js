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
        var operators = [],
            operands = []

        var proc = function () {
            var values = [operands.pop(), operators.pop(), operands.pop()]


            operands.concat(values)
        }

        while (tokens.length > 0) {

            var token = tokens.shift(),
                next = tokens[0]

            //if character is operand or (. push on the operandStack
            switch (token.name) {
                case 'OTHER':
                    // check if token is identifier followed by (. If so, treat the function as an operator
                    // and its arguments as operands. This is compatible with the Shunting-yard algorithm
                    if (next && next.name === 'BEG_ARGS') {
                        
                        // then push the function token on to the operators stack
                        if (operators.length === 0) {
                            operators.push({
                                type: 'func',
                                precedence: 3,
                                content: token.found
                            })
                        } else while ( 3 > last(operators).precedence ) {
                            operators.push({
                                type: 'func',
                                precedence: 3,
                                content: token.found
                            })
                
                        }

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
