function omit (obj, keys) {

    var retVal = {}

    if (typeof keys === 'string') keys = [keys]

    Object.keys(obj).forEach(function (key) {

        if (keys.indexOf(key) === -1) {
            retVal[key] = obj[key]
        }

    })

    return retVal

}

module.exports = omit