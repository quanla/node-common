var Async       = require("node-common/common-utils").Async;
var Cols        = require("node-common/common-utils").Cols;
var RegexUtil   = require("node-common/common-utils").RegexUtil;

var path = require("path");

module.exports = function(options) {

    var chokidar = require("chokidar");

    var injectScss = Async.rapidCallAbsorber(scssPointInjector(options.from, options.into, options.name));

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


    function scssPointInjector(from, into, name) {
        var glob = require("glob");

        return function() {
            glob("./" + from + "/**/*.scss", null, function (er, files) {
                var fs = require("fs");
                files.sort();

                fs.readFile("./" + into, "utf8", function(err, content) {
                    content = require("./injector-common").replaceLinesBetween("// Inject" + (name ? " " + name : "") + " start", "// Inject" + (name ? " " + name : "") + " end", content, Cols.yield(files, function(file) {
                        var relativePath = path.relative("/" + path.dirname(into), path.dirname(file.replace(/^\./,""))).replace(/\\/g, "/");
                        return "@import \"" + relativePath + "/" + path.basename(file).replace(/\.scss$/,"") + "\";";
                    }));
                    fs.writeFile("./" + into, content);
                });
            });
        };
    }

};