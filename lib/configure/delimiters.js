/*
    Keep in mind, since we are parsing from left to right, order matters
    A left-hand match should come before a right-hand match.
*/

var delimiters = {
    BEG_EXP: '(',
    END_EXP: ')',
    USE_VAR: '$',
    COL_SEP: ':',
    ARG_SEP: ','
}

module.exports = delimiters
