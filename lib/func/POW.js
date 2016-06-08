var assign = require('../util/assign')

function POW (args, ctx) {
    var base = args[0].value ? args[0].value : ctx[args[0].name],
        exponent = args[1] ? args[1].value : ctx[args[1].name]

    return Math.pow(base, exponent) 
}

assign(POW.prototype, {

    compile: function () {

    }

})

module.exports = POW
