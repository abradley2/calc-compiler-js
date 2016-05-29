var assign = require('./util/assign')

function Node (type, token) {
    this.type = type
    this.token = token

    if (type === 'OPERATOR') {
        this.precedence = {
            '+': 0,
            '-': 0,
            '/': 1,
            '*': 1
        }[token.found]
    }

}

function tree (tokens) {

    var root = {
        type: 'Root',
        nodes: []
    }

    // http://stackoverflow.com/questions/13421424/how-to-evaluate-an-infix-expression-in-just-one-scan-using-stacks#answer-16068554
    var operators = [],
        operands = []

    while (tokens.length > 0) {
        var token = tokens.shift()
        // if character is operand or (. push on the operandStack
        switch (token.name) {
            case 'OTHER':
                operands.push( new Node('OTHER', token) )
                break
            case 'ARG_SEP':
                operators.push( new Node('ARG_SEP', token) )
                break
            case 'OPERATOR':
                operators.push( new Node('OPERATOR', token) )
                break
            case 'GET_VAR':
                operands.push( new Node('GET_VAR', token) )
                break
            case 'BEG_ARGS':
                operands.push( new Node('BEG_ARGS', token) )
                break
            case 'END_ARGS':
                operands.push( new Node('END_ARGS', token) )
                break
            default:
                break
        }
    }

    console.log('operators = ',operators)
    console.log('operands = ',operands)

}

module.exports = tree
