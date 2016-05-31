function SUM () {
    var retVal = 0

    for (var i = 0; i < arguments.length; i++) retVal += arguments[i]

    return retVal
}

module.exports = SUM
