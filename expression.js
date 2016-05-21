var RegexUtil = require("./common-utils").RegexUtil;
var RangeUtil   = require("./common-utils").RangeUtil;

function findEscapedBlocks(exp) {
    var escapeChars = ["'", "\""];
    var ret = [];

    for (var i = 0; i < exp.length; i++) {
        var c = exp[i];
        if (escapeChars.indexOf(c) > -1) {
            var escapeChar = c;
            var to = exp.indexOf(escapeChar, i+1);
            ret.push({
                from: i,
                to: to + 1
            });
            i = to;
        }
    }
    return ret;
}

function expF(exp) {
    var escapedBlocks = findEscapedBlocks(exp);

    var decorated = RegexUtil.replaceAll(exp, "[$\\w.]+", function(m) {
        var v = m[0];

        if (RangeUtil.inside(m.index, escapedBlocks)) {
            return v;
        }

        if (isNaN(v)) {
            return "context." + v;
        } else {
            return v;
        }
    });
    var f = new Function("context", "return " + decorated + ";");
    return function(context) { return f.apply(null, [context]); };
}
module.exports = expF;

expF("link.link == currentLink ? 'active':''");