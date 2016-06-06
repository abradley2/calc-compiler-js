var assign = require('../util/assign')

function DIFF (args, ctx) {
    var retVal

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            retVal += parseFloat(ctx[arg.value])
        } else {
            retVal += parseFloat(arg.value)
        }
    })

    return retVal
}

assign(DIFF.prototype, {

    compile: function () {

    }

})

module.exports = DIFF
