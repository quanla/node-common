var Async = require("node-common/common-utils").Async;

var path = require("path");

module.exports = function() {

    function scssPointCompiler(fromFile, toFile) {
        var sass = require('node-sass');

        return function() {
            sass.render({file: "./" + fromFile}, function(error, result) {
                if(!error){
                    var fs = require("fs");
                    fs.writeFile("./" + toFile, result.css);
                    //console.log("Duration: " + (new Date().getTime() - start));
                } else {
                    console.error(error);
                }
            });
        };
    }

    var watchLocs = [];

    var fromFile;

    var compiler;
    return compiler = {
        from: function(fromFile1) {
            fromFile = fromFile1;
            return compiler;
        },
        watch: function(watchLoc) {
            watchLocs.push(watchLoc);
            return compiler;
        },
        into: function(intoFile) {

            var chokidar = require("chokidar");

            var compileScss = Async.rapidCallAbsorber(scssPointCompiler(fromFile, intoFile));

            chokidar
                .watch(watchLocs.map((loc) => "./" + loc), {ignoreInitial: true})
                .on('change', function(event, path) {
                    compileScss();
                })
            ;
        }
    };
};