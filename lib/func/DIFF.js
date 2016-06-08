var assign = require('../util/assign')

function DIFF (args, ctx) {
    var retVal

    args.forEach(function (arg) {
        var mod

        if (arg.type === 'VAR') {
            mod = parseFloat(ctx[arg.name])
        } else {
            mod = parseFloat(arg.value)
        }

        if (retVal) { retVal -= mod } else { retVal = mod }

    })

    return retVal
}

assign(DIFF.prototype, {

    compile: function () {
        return this.toString()
    }

})

module.exports = DIFF
