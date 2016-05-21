var RegexUtil   = require("node-common/common-utils").RegexUtil;
var Cols        = require("node-common/common-utils").Cols;

module.exports = {
    replaceLinesBetween: function (lineStart, lineEnd, content, lines) {
        var match = new RegExp("([\t ]*)" + RegexUtil.escape(lineStart) + "(\r?\n)").exec(content);
        var start = match.index + match[0].length;

        var indent = match[1];
        var lineFeed = match[2];

        var m1 = new RegExp(RegexUtil.escape(lineEnd) + "(\r?\n|$)").exec(content.substring(start));
        var end = m1.index + start;

        return content.substring(0, start) + indent + Cols.join(lines, lineFeed + indent) + lineFeed + indent + content.substring(end);
    }
};
