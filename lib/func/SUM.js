var assign = require('../util/assign')

function SUM (args, ctx) {
    var retVal = 0

    args.forEach(function (arg) {

        if (arg.type === 'VAR') {
            retVal += parseFloat(ctx[arg.name])
        } else {
            retVal += parseFloat(arg.value)
        }

    })

    return retVal
}

assign(SUM.prototype, {

    compile: function () {

    }

})

module.exports = SUM
