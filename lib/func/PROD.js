var assign = require('../util/assign')

function PROD (args, ctx) {
    var retVal

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            retVal = retVal * parseFloat(ctx[arg.content])
        } else {
            retVal = retVal * parseFloat(ctx[arg.content])
        }
    })
}

assign(PROD.prototype, {

    compile: function () {

    }

})

module.exports = PROD
