var path = require("path");

module.exports = function(serverOptions) {

    function scssPointCompiler(compileScssPoint) {
        var sass = require('node-sass');

        return function() {
            sass.render({file: "./" + compileScssPoint.from}, function(error, result) {
                if(!error){
                    var fs = require("fs");
                    fs.writeFile("./" + compileScssPoint.to, result.css);
                    //console.log("Duration: " + (new Date().getTime() - start));
                } else {
                    console.error(error);
                }
            });
        };
    }

    function scssPointInjector(compileScssPoint) {
        var glob = require("glob");

        return function() {
            glob("./" + compileScssPoint.appScss + "/**/*.scss", null, function (er, files) {
                var fs = require("fs");
                files.sort();

                fs.readFile("./" + compileScssPoint.from, "utf8", function(err, content) {
                    content = replaceLinesBetween("// Inject start", "// Inject end", content, Cols.yield(files, function(file) {
                        var relativePath = path.relative("/" + path.dirname(compileScssPoint.from), path.dirname(file.replace(/^\./,""))).replace(/\\/g, "/");
                        return "@import \"" + relativePath + "/" + path.basename(file) + "\";";
                    }));
                    fs.writeFile("./" + compileScssPoint.from, content);
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

    return {
        start: function() {

            var chokidar = require("chokidar");

            serverOptions.compileScss.forEach(function(compileScssPoint) {

                var compileScss = Async.rapidCallAbsorber(scssPointCompiler(compileScssPoint));

                var watchPaths = compileScssPoint.watches.map(function(w) { return "./" + w + "/**/*.*"; });
                chokidar
                    .watch(
                        watchPaths.concat(["./" + compileScssPoint.appScss + "/**/*.scss"])
                        , {
                            ignoreInitial: true
                        }
                    )
                    .on('change', function(event, path) {
                        //console.log("Compiling scss");
                        compileScss();
                    })
                ;
            });

            serverOptions.compileScss.forEach(function(compileScssPoint) {
                var injectScss = Async.rapidCallAbsorber(scssPointInjector(compileScssPoint));

                chokidar
                    .watch("./" + compileScssPoint.appScss + "/**/*.scss", {
                        ignoreInitial: true
                    })
                    .on('add', function(event, path) {
                        injectScss();
                    })
                    .on('unlink', function(event, path) {
                        injectScss();
                    })
                ;
            });
        }
    };
};