var Async = require("node-common/common-utils").Async;
//var Fs    = require("node-common/common-utils").Fs;

module.exports = function() {

    var sendAllClients;

    var embededJsTemplate = require("fs").readFileSync(__dirname + "/embed.js", "utf8");


    var reloadPage = Async.rapidCallAbsorber(function() {
        sendAllClients({action: "reloadPage"});
    });

    var port;
    return {
        setPort: function(port1) {
            port = port1;
        },
        htmlModifier: function(html) {
            html = html.replace("</body>", "<script>" + embededJsTemplate.replace("$port", port) + "</script>");
            return html;
        },
        express: function(app) {
            var expressWs = require('express-ws')(app);

            app.ws('/hot-reload', function(ws, req) {
            });
            var aWss = expressWs.getWss('/hot-reload');

            sendAllClients = function(msg) {
                var msgStr = JSON.stringify(msg);
                aWss.clients.forEach(function (client) {
                    try {
                        client.send(msgStr);
                    } catch (e) {
                        console.error(e);
                    }
                });
            };
        },
        reload: reloadPage
    };
};