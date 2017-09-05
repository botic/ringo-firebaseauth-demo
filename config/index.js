/**
 * @fileoverview You can set the configuration of this module with a
 * command line switch. Provide `-h` (or `--home`) with the path to
 * a custom configuration directory.
 */
const log = require("ringo/logging").getLogger(module.id);
const fs = require("fs");
const system = require("system");
const {Parser} = require("ringo/args");
const config = require("gestalt").load(module.resolve("./config.json"));

const parser = new Parser();
parser.addOption("h", "home", "home", "Path to home directory");
const opts = parser.parse(system.args.slice(1));

// default template path
config.set("templates", [
    module.resolve("../../templates")
]);

let home = fs.resolve(opts.home || module.directory);
if (opts.home) {
    home = fs.absolute(fs.resolve(opts.home + "/"));
    const customConfigFile = fs.resolve(home, "./config.json");
    log.info("Loading configuration file {}", customConfigFile);
    if (fs.exists(customConfigFile)) {
        config.merge(customConfigFile);
    }
}

let logConfig = fs.resolve(home, "./log4j.properties");
if (!fs.exists(logConfig)) {
    logConfig = module.resolve("./log4j.properties");
}

config.set("home", home);
config.set("logging", getResource(fs.absolute(logConfig)));

module.exports = config;
