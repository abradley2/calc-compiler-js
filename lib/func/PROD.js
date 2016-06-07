var assign = require('../util/assign')

function PROD (args, ctx) {
    var retVal = 1

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            retVal = retVal * parseFloat(ctx[arg.name])
        } else {
            retVal = retVal * parseFloat(arg.value)
        }
    })

    return retVal
}

assign(PROD.prototype, {

    compile: function () {

    }

})

module.exports = PROD
