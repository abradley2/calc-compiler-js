function defaults (target, source) {

    for (key in source) {

        // do not copy inherited properties of the source
        if ( !Object.prototype.hasOwnProperty.call(source, key) ) continue

        // allow overwriting of targets inherited properties, so use 'in'
        if ( !(key in target) ) target[key] = source[key]

    }

    return target

}

module.exports = defaults
