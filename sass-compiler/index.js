var Async = require("node-common/common-utils").Async;
var Fs    = require("node-common/common-utils").Fs;

var path = require("path");

module.exports = function(options) {


    function scssPointCompiler(fromFile, toFile) {
        var sass = require('node-sass');

        return function() {
            sass.render({file: "./" + fromFile}, function(error, result) {
                if (!error) {
                    var fs = require("fs");
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

    var onCompileds = [];
    return {
        onCompiled: function(onCompiled) {
            onCompileds.push(onCompiled);
        }
    };
};