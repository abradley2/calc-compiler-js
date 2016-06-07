var assign = require('../util/assign')

function POW (args, ctx) {
    var base = args[0],
        exponent = args[1]

    return Math.pow(base, exponent) 
}

assign(POW.prototype, {

    compile: function () {

    }

})

module.exports = POW
