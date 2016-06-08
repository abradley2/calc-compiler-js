var assign = require('../util/assign')

function CONCAT (args, ctx) {

    console.log('args = ',args)

    var parsedArgs = args.map(function (arg) {
        console.log('args = ',args)
        if (arg.value) {
            return arg.value
        } else {
            return ctx[arg.name]
        }
    })

    return ('').concat(parsedArgs)

}

module.exports = CONCAT