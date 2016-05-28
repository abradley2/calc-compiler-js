function tree (tokens) {

    console.log('tokens = ', tokens)

    var root = {
        type: 'Root',
        nodes: []
    }

    /*
        BEG_ARGS: '(',
        END_ARGS: ')',
        USE_VAR: '$',
        ARG_SEP: ',',
        FIX_ROW: ':',
        OPERATOR: '+|-|*|/',
        ASSIGN: '='
    */

    for (var i = 0; i < 10; i++) {

        var token = tokens[i]

        switch (token.name) {
            case 'BEG_ARGS':
                console.log('BEG_ARGS')
                break
            case 'END_ARGS':
                console.log('END_ARGS')
                break
            case 'USE_VAR':
                console.log('USE_VAR')
                break
            case 'ARG_SEP':
                console.log('ARG_SEP')
                break
            case 'FIX_ROW':
                console.log('FIX_ROW')
                break
            case 'OPERATOR':
                console.log('OPERATOR')
                break
            case 'ASSIGN':
                console.log('ASSIGN')
            default:
                console.log('NO NODE MATCH')
                break
        }


    }

}

module.exports = tree
