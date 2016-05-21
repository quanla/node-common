var Async       = require("node-common/common-utils").Async;
var Cols        = require("node-common/common-utils").Cols;
var RegexUtil   = require("node-common/common-utils").RegexUtil;

var path = require("path");

module.exports = function(options) {

    var chokidar = require("chokidar");

    var injectScss = Async.rapidCallAbsorber(scssPointInjector(options.from, options.into));

    chokidar
        .watch("./" + options.from + "/**/*.scss", {
            ignoreInitial: true
        })
        .on('add', function(event, path) {
            injectScss();
        })
        .on('unlink', function(event, path) {
            injectScss();
        })
    ;
    injectScss();


    function scssPointInjector(from, into) {
        var glob = require("glob");

        return function() {
            glob("./" + from + "/**/*.scss", null, function (er, files) {
                var fs = require("fs");
                files.sort();

                fs.readFile("./" + into, "utf8", function(err, content) {
                    content = replaceLinesBetween("// Inject start", "// Inject end", content, Cols.yield(files, function(file) {
                        var relativePath = path.relative("/" + path.dirname(into), path.dirname(file.replace(/^\./,""))).replace(/\\/g, "/");
                        return "@import \"" + relativePath + "/" + path.basename(file).replace(/\.scss$/,"") + "\";";
                    }));
                    fs.writeFile("./" + into, content);
                });
            });
        };
    }

    function replaceLinesBetween(lineStart, lineEnd, content, lines) {

        var match = new RegExp(RegexUtil.escape(lineStart) + "(\r?\n)").exec(content);
        var start = match.index + match[0].length;

        var lineFeed = match[1];

        var m1 = new RegExp(RegexUtil.escape(lineEnd) + "\r?\n").exec(content);
        var end = m1.index;

        return content.substring(0, start) + Cols.join(lines, lineFeed) + lineFeed + content.substring(end);
    }
};