var Async       = require("node-common/common-utils").Async;
var Cols        = require("node-common/common-utils").Cols;
var fs = require("fs");

var path = require("path");

module.exports = function(options) {

    var chokidar = require("chokidar");

    var injectHtml = Async.rapidCallAbsorber(injector(options.points, options.into));

    chokidar
        .watch(options.points.map((point) => `./${point.from}/**/*.js`), {
            ignoreInitial: true
        })
        .on('add', function(event, path) {
            injectHtml();
        })
        .on('unlink', function(event, path) {
            injectHtml();
        })
    ;
    injectHtml();


    function injector(points, into) {
        var glob = require("glob");

        var q = require("q");
        function resolveFiles(point) {
            var defer = q.defer();
            glob(`./${point.from}/**/*.js`, null, function (er, files) {
                if (er) {
                    defer.reject(er);
                } else {
                    defer.resolve({point: point,files: files});
                }
            });
            return defer.promise;
        }

        return function() {
            q.all(options.points.map(resolveFiles)).then(function(pointResults) {
                fs.readFile("./" + into, "utf8", function(err, content) {
                    pointResults.forEach(function(pointResult) {
                        pointResult.files.sort();
                        content = require("./injector-common").replaceLinesBetween("<!-- Inject" + (pointResult.point.name ? " " + pointResult.point.name : "") + " start -->", "<!-- Inject" + (pointResult.point.name ? " " + pointResult.point.name : "") + " end -->", content, pointResult.files.map(function(file) {
                            var relativePath = path.relative("/" + path.dirname(into), path.dirname(file.replace(/^\./,""))).replace(/\\/g, "/");

                            return `<script src="${relativePath + "/" + path.basename(file)}"></script>`;
                        }));
                    });

                    fs.writeFile("./" + into, content);
                });
            });
        };
    }

};