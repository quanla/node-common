var Async = require("node-common/common-utils").Async;
var Fs    = require("node-common/common-utils").Fs;

var path = require("path");
var fs = require("fs");

module.exports = function(options) {


    function scssPointCompiler(fromFile, toFile) {
        var sass = require('node-sass');

        return function() {
            sass.render({file: "./" + fromFile}, function(error, result) {
                if (!error) {
                    fs.writeFileSync("./" + toFile, result.css);

                    Fs.invokeAll(onCompileds);
                } else {
                    console.error(error);
                }
            });
        };
    }

    var chokidar = require("chokidar");

    var compileScss = Async.rapidCallAbsorber(scssPointCompiler(options.from, options.into));

    chokidar
        .watch(options.watches.map((loc) => "./" + loc), {ignoreInitial: true})
        .on('change', function(event, path) {
            compileScss();
        })
    ;

    require("mkdirp")(path.dirname(options.into));

    var onCompileds = [];
    return {
        onCompiled: function(onCompiled) {
            onCompileds.push(onCompiled);
        }
    };
};