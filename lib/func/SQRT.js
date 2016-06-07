var assign = require('../util/assign')

function SQRT (args, ctx) {
    if (args[0].type === 'VAR') {
        return Math.sqrt( ctx[args[0].name] )
    } else {
        return Math.sqrt( args[0].value )
    }
}

assign(SQRT.prototype, {

    compile: function () {

    }

})

module.exports = SQRT