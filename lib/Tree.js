var assign = require('./util/assign'),
    last = require('./util/last')

function Tree (tokens) {
    this.tokens = tokens
}

assign(Tree.prototype, {

    parse: function () {

        // create a clone of the tokens array so it is not mutated
        var tokens = this.tokens.slice()

        // remove whitespace tokens. They aren't relevant
        this.removeWhitespaceTokens(tokens)

        return this.getExpressionNode(tokens)
    },

    // function for removing all whitespace tokens
    removeWhitespaceTokens: function (tokens) {
        tokens = tokens.filter(function (token) {
            return token.name !== 'WHITESPACE'
        })
        return tokens
    },

    getExpressionNode: function (tokens) {

        // Shunting-yard algorithm
        // https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        var stack = [],
            output = [],
            arity = []

        while (tokens.length > 0) {

            var token = tokens.shift(),
                next = tokens[0]

            switch (token.name) {
                case 'IDENTIFIER':
                    
                    if (next && next.name === 'BEG_ARGS') {
                        arity.push(1)
                        stack.push({
                            type: 'FUNC',
                            name: token.found
                        })
                    } else {
                        output.push({
                            type: 'VAR',
                            name: token.found
                        })
                    } 
                    break

                case 'STRING':
                    output.push({
                        type: 'STRING',
                        value: token.found
                    })
                    break

                case 'NUMBER':
                    output.push({
                        type: 'NUMBER',
                        value: parseFloat(token.found)
                    })
                    break

                case 'BEG_ARGS':
                    stack.push({
                        type: 'BEG_ARGS',
                        content: token.found
                    })
                    break

                case 'END_ARGS':
                    while ( last(stack) && last(stack).type !== 'BEG_ARGS' ) {
                        output.push( stack.pop() )
                    }
                    if ( last(stack) && last(stack).type === 'BEG_ARGS') {
                        stack.pop()
                    }
                    if ( last(stack) && last(stack).type === 'FUNC') {
                        var func = stack.pop()
                        func.arity = arity.pop()
                        output.push( func )
                    }
                    break

                case 'ARG_SEP':
                    if (arity.length > 0) {
                        ++arity[arity.length - 1]
                    } else {
                        throw new Error('Unexpected comma outside argument list')
                    }

                    /*
                        Until the token at the top of the stack is a left parenthesis, 
                        pop operators off the 
                        stack onto the output queue. 

                        An argument separator essentially works as a closing parentheses
                        that does not terminate the parsing of function arguments
                    */
                    while ( last(stack) && last(stack).type !== 'BEG_ARGS' ) {
                        output.push( stack.pop() )
                    }
                    if ( stack.length === 0 || last(stack).type !== 'BEG_ARGS' ) {
                        throw new Error('Missing openining  ( in arguments list')
                    }
                    break

                case 'OPERATOR':
                    var precedence, associative
                    if (token.found === '*' || token.found === '/') {
                        precedence = 3
                        associative = 'left'
                    } 
                    if (token.found === '+' || token.found === '-') {
                        precedence = 2
                        associative = 'left'
                    }

                    
                    // while there is an operator token o2, at the top of the operator stack and either
                    while (last(stack) && last(stack).type === 'OPERATOR') {
                        // o1 is left-associative and its precedence is less than or equal to that of o2, or...
                        if (associative === 'left' && precedence <= last(stack).precedence ) {
                            output.push( stack.pop() )
                        // o1 is right associative, and has precedence less than that of o2, 
                        } else if (associative === 'right' && precedence < last(stack).precedence) {
                            output.push( stack.pop() )
                        } else {
                            break
                        }
                    }

                    stack.push({
                        type: 'OPERATOR',
                        associative: associative,
                        precedence: precedence,
                        content: token.found
                    })
                    break
                default:
                    break

            }

        }

        while (stack.length !== 0) output.push( stack.pop() )

        return output

    }

})

module.exports = Tree
