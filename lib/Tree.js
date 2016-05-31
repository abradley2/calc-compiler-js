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

    /*
        function for removing all whitespace token
    */
    removeWhitespaceTokens: function (tokens) {
        tokens = tokens.filter(function (token) {
            return token.name !== 'WHITESPACE'
        })
        return tokens
    },

    /* 
        Get a singular function argument.
        Called by getFunctionArgs
    */
    getFunctionArgs: function (tokens, _args) {
        var args = _args || []

        var token = tokens.shift()

        switch (token.name) {
            case 'ARG_SEP':
                return this.getFunctionArgs(tokens, args)
            case 'OTHER':
                args.push( this.getOtherNode(token, tokens) )
                return this.getFunctionArgs(tokens, args)
            case 'BEG_ARGS':
                args.push( this.getExpressionNode(tokens) )
                return this.getFunctionArgs(tokens, args)
            case 'END_ARGS':
                return args
            default:
                return args
                //throw new Error('ERROR: unexpected end of arguments', token)
        }

    },


    /*
        Get a function node
        Called when an identifier is followed by a (
        which signifies the beginning of an argument list or invocation
    */
    getFunctionNode: function (token, tokens) {
        var begArgToken = tokens.shift()

        // get all the args until the end parens is found
        var args = this.getFunctionArgs(tokens)

        console.log('args = ',args)

        return {
            type: 'function',
            // nodes can be constants or other functions
            nodes: []
        }

    },

    /*
        Get a constant node
        Called when a col/row lookup (identifier not followed by function args),
        string, or number is found
    */
    getConstantNode: function (token, tokens) {
        var next = tokens[0]

        if (next && next.name === 'BEG_ARGS') {

            return this.getFunctionNode(token, tokens)

        } else {

            return {
                type: 'constant',
                content: token.found,
                // constants do not have nodes
                nodes: null
            }

        }

    },

    getOtherNode: function (token, tokens) {
        // order is important here
        if ( token.found.match(/^\d/) ) {
        
            return this.getConstantNode(token, tokens)
        
        } else if ( token.found.match(/^\w/) ) {
        
            return this.getIdentifierNode(token, tokens)
        
        } else if ( token.found.match(/^"/) ) {
        
            return this.getConstantNode(token, tokens)

        } else {

            throw new Error('ERROR: unidentified token: ', token)

        }

    },

    getIdentifierNode: function (token, tokens) {
        var next = tokens[0]

        if (next && next.name === 'BEG_ARGS') {
            return this.getFunctionNode(token, tokens)
        } else {
            return {
                type: 'IDENTIFIER',
                content: token.found,
                nodes: null
            }
        }


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
                case 'OTHER':
                    operands.push( this.getOtherNode(token, tokens) )
                    break
                case 'BEG_ARGS':

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
            assignsTo: null,
            // nodes can be functions or constants
            nodes: {
                operators: operators,
                operands: operands
            }
        }

    }

})

module.exports = Tree
