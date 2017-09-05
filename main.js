const config = require("./config");

const engine = require("ringo/engine");
const strings = require("ringo/utils/strings");

const logging = require("ringo/logging");
logging.setConfig(config.get("logging"), true);
const log = logging.getLogger(module.id);

const httpServer = require("httpserver");
let server = null;


const init = exports.init = function() {
    log.info("Initializing application ...");

    // add all jar files in jars directory to classpath
    getRepository(module.resolve("./jars/")).getResources().filter(function(r) {
        return strings.endsWith(r.name, ".jar");
    }).forEach(function(file) {
        addToClasspath(file);
    });

    // configure the server
    server = httpServer.build()
        .serveApplication("/", module.resolve("./app/router"), {
            "virtualHosts": config.get("server:vhosts")
        });

    if (config.get("server:http") && config.get("server:http:host")) {
        server.http({
            "host": config.get("server:http:host"),
            "port": config.get("server:http:port")
        });
    }

    if (config.get("server:https") && config.get("server:https:host")) {
        server.https({
            "host": config.get("server:https:host"),
            "port": config.get("server:https:port"),
            "keyStore": config.get("server:https:keyStore"),
            "keyStorePassword": config.get("server:https:keyStorePassword"),
            "keyManagerPassword": config.get("server:https:keyManagerPassword"),
            "includeCipherSuites": config.get("server:https:includeCipherSuites")
        });
    }

    server.start();
    engine.addShutdownHook(function() {
        stop();
    });
    log.info("Server started.");
};

const start = exports.start = function() {
    // do nothing
    log.info("Started application.");
};

const stop = exports.stop = function() {
    if (server !== null) {
        server.stop();
    }

    log.info("Stopped application.");
};

if (require.main == module.id) {
    init();
    start();
}
