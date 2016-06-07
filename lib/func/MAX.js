var assign = require('../util/assign')

function MAX (args, ctx) {

    var vals = []

    args.forEach(function (arg) {
        if (arg.type === 'VAR') {
            vals.push( ctx[arg.name] )
        } else {
            vals.push( arg.value )
        }
    })

    return Math.max.apply(Math, vals)

}

assign(MAX.prototype, {

    compile: function () {

    }

})

module.exports = MAX