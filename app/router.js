const response = require("ringo/jsgi/response");
const log = require("ringo/logging").getLogger(module.id);
const {AsyncResponse} = require("ringo/jsgi/connector");

const {Application} = require("stick");
const app = exports.app = new Application();
app.configure("static", "params", "mount", "route");

const {verifyIdToken} = require("./service");

app.get("/", function(req) {
    return response.redirect("/app/");
});

app.static(module.resolve("../static/"), "index.html", "/app");

app.get("/verify", function(req) {
    if (!req.queryParams.idToken) {
        return response.bad().json({
            "error": "idToken param missing!"
        });
    }

    // we need an async response since the token validation happens
    // asynchronous via the Firebase SDK
    const asyncResponse = new AsyncResponse(req, 30000);
    asyncResponse.start(200, {"Content-Type": "application/json"});
    verifyIdToken(req.queryParams.idToken, function(decodedToken) {
        const claims = decodedToken.getClaims();

        asyncResponse.write(JSON.stringify({
            "uid": decodedToken.getUid(),
            "provider": claims.get("firebase").get("sign_in_provider")
        }));
        asyncResponse.close();
    }, function() {
        asyncResponse.close();
    });

    return asyncResponse;
});
