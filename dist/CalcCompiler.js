(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CalcCompiler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var compiler = require('./lib/compiler'),
    c = new compiler()


var testTemplate = 'COL_3 = ADD(COL_1 , 7)'

c.compileTemplate( testTemplate )

module.exports = compiler

},{"./lib/compiler":2}],2:[function(require,module,exports){
var grammar = require('./grammar'),
    delimiters = require('./configure/delimiters'),
    tokenize = require('./tokenize'),
    tree = require('./tree'),
    assign = require('./util/assign')

var compiler = function (settings) {
    settings = settings || {}

    // allow adding custom delimiters. Keep ones that aren't overriden
    this.delimiters = assign(delimiters, settings.delimiters || {})

    this.grammar = grammar( this.delimiters )

}

compiler.prototype.compileTemplate = function (template) {

    var tokens = tokenize(template, this.grammar),
        ast = tree(tokens)

}



module.exports = compiler

},{"./configure/delimiters":3,"./grammar":4,"./tokenize":5,"./tree":6,"./util/assign":7}],3:[function(require,module,exports){
var delimiters = {
    BEG_ARGS: '(',
    END_ARGS: ')',
    USE_VAR: '$',
    ARG_SEP: ',',
    FIX_ROW: ':',
    OPERATOR: '+|-|*|/',
    ASSIGN: '='
}

module.exports = delimiters

},{}],4:[function(require,module,exports){
var getEscaped = require('./util/getEscaped'),
    pluck = require('./util/pluck')

function delimiterToRegex (name, val) {
    var regexString = getEscaped(val)

    return {
        name: name,
        regexString: regexString,
        test: new RegExp( '^' + regexString )
    }
}

var grammar = function (delimiters) {

    var regexes = []

    Object.keys(delimiters).forEach(function (name) {
        regexes.push(
            delimiterToRegex(name, delimiters[name] )
        )
    })

    // add in a regex to match any whitespace
    regexes.push({
        name: 'WHITESPACE',
        regexString: '[\ \t\r\n]+',
        test: new RegExp('^[\ \t\r\n]+')
    })

    // create a regex that matches anything apart from keywords and whitespace
    var allRegex = pluck(regexes, 'regexString').join('|')
    regexes.push({
        name: 'OTHER',
        test: new RegExp('^((?!' + allRegex + ').)*')
    })

    return regexes

}

module.exports = grammar

},{"./util/getEscaped":8,"./util/pluck":9}],5:[function(require,module,exports){
function yieldNextToken (tpl, grammar, stack) {

    grammar.some(function (grammarObj) {

        var match = grammarObj.test.exec(tpl)

        if (match) {
            tpl = tpl.replace(grammarObj.test, '')
            stack.push({
                name: grammarObj.name,
                found: match[0]
            })
            return true
        }

    })

    return tpl

}

function tokenize (tpl, grammar) {
    var template = tpl,
        stack = []

    while (template.length > 0){
        template = yieldNextToken(template, grammar, stack)

        /*
            Once there's at least 2 elements on the stack, give each stack
            element a reference to the previous one for convenience
        */
        if (stack.length >= 2) {

            stack[stack.length - 1].previous = stack[stack.length - 2]

        }

    }

    return stack
}

module.exports = tokenize

},{}],6:[function(require,module,exports){
function tree (tokens) {

    console.log('tokens = ', tokens)

    var root = {
        type: 'Root',
        nodes: []
    }

    /*
        BEG_ARGS: '(',
        END_ARGS: ')',
        USE_VAR: '$',
        ARG_SEP: ',',
        FIX_ROW: ':',
        OPERATOR: '+|-|*|/',
        ASSIGN: '='
    */

    for (var i = 0; i < 10; i++) {

        var token = tokens[i]

        switch (token.name) {
            case 'BEG_ARGS':
                console.log('BEG_ARGS')
                break
            case 'END_ARGS':
                console.log('END_ARGS')
                break
            case 'USE_VAR':
                console.log('USE_VAR')
                break
            case 'ARG_SEP':
                console.log('ARG_SEP')
                break
            case 'FIX_ROW':
                console.log('FIX_ROW')
                break
            case 'OPERATOR':
                console.log('OPERATOR')
                break
            case 'ASSIGN':
                console.log('ASSIGN')
            default:
                console.log('NO NODE MATCH')
                break
        }


    }

}

module.exports = tree

},{}],7:[function(require,module,exports){
function assign (target, source) {

    for (key in source) {

        // make sure only owned properties of the source are assigned
        if ( Object.prototype.hasOwnProperty.call(source, key) ) {
            target[key] = source[key]
        }

    }

    return target

}

module.exports = assign

},{}],8:[function(require,module,exports){
function getEscaped (str) {
    /*
        basically any special character I want to escape, preceded by a \
        should escape [], (), {}, +, =, -, ^, $, &, |, and !
    */
    var escapes = /[\^\$\\\/\[\]\{\}\(\)\|\+\=\-\!]/g;

    return str.replace(escapes,"\\$&");
}

module.exports = getEscaped

},{}],9:[function(require,module,exports){
function pluck (collection, prop) {

    return collection.map(function (item) {
        return item[prop]
    })

}

module.exports = pluck

},{}]},{},[1])(1)
});