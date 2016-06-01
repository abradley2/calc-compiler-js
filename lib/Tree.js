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

        // Shunting-yard algorithm
        // https://en.wikipedia.org/wiki/Shunting-yard_algorithm
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
                            type: 'NUM',
                            content: token.found
                        })
                    } else if (next && next.name === 'BEG_ARGS') {
                        stack.push({
                            type: 'FUNC',
                            content: token.found
                        })
                    } else {

                        output.push({
                            type: 'CONST',
                            content: token.found
                        })

                    } 

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
                    stack.push({
                        type: 'END_ARGS',
                        content: token.found
                    })
                    break

                case 'ARG_SEP':
                    while ( last(stack) && last(stack).type !== 'BEG_ARGS' ) {
                        output.push( stack.pop() )
                    }
                    stack.push({
                        type: 'ARG_SEP',
                        content: token.found
                    })
                    break

                case 'OPERATOR':
                    var precedence, associative
                    if (token.found === '*' || token.found === '/') {
                        precedence = 2
                        associative = 'left'
                    } 
                    if (token.found === '+' || token.found === '-') {
                        precedence = 1
                        associative = 'left'
                    }

                    while (last(stack) && last(stack).type === 'operator') {
                        if (associative === 'left' && precedence <= last(stack).precedence ) {
                            output.push( stack.pop() )
                        } else if (associative === 'right' && precedence < last(stack).precedence) {
                            output.push( stack.pop() )
                        } else {
                            break
                        }
                    }

                    stack.push({
                        type: 'operator',
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
