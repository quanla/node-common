module.exports = function(dirName) {


    var ngAnnotate = require("ng-annotate");
    function annotateJsFile(path) {
        var fs = require("fs");
        fs.readFile("./" + path, "utf8", function(err, content) {
            var annotatedContent = ngAnnotate(content, { map: false, remove: true, add: true }).src;
            if (StringUtil.isNotEmpty(annotatedContent) && annotatedContent != content) {
                console.log("Annotated " + path);
                fs.writeFile("./" + path, annotatedContent);
            }
        });
    }

    var chokidar = require("chokidar");

    chokidar
        .watch("./" + dirName + "/**/*.js", {
            ignoreInitial: true
        })
        .on('change', function(path, stats) {
            annotateJsFile(path);
        })
    ;
};