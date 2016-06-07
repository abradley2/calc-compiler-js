var assign = require('../util/assign')

function MIN (args, ctx) {

    var vals = []

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            vals.push( ctx[arg.name] )
        } else {
            vals.push( arg.value )
        }
    })

    return Math.min.apply(Math, vals)

}

assign(MIN.prototype, {

    compile: function () {

    }

})

module.exports = MIN