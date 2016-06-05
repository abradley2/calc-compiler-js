var assign = require('../util/assign')

function DIFF (args, ctx) {
    var retVal

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            retVal += parseInt(ctx[arg.content])
        } else {
            retVal += parseInt(arg.content)
        }
    })

    return retVal
}

assign(DIFF.prototype, {

    compile: function () {

    }

})

module.exports = DIFF
