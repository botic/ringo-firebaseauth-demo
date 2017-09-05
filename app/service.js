const config = require("../config");
const log = require("ringo/logging").getLogger(module.id);

const {JavaEventEmitter} = require("ringo/events");

const {FirebaseApp, FirebaseOptions} = Packages.com.google.firebase;
const {FirebaseAuth, FirebaseCredentials} = Packages.com.google.firebase.auth;
const {OnSuccessListener, OnFailureListener} = Packages.com.google.firebase.tasks;

const firebaseApp = module.singleton("firebaseApp", function() {
    const options = new FirebaseOptions.Builder()
        .setCredential(
            FirebaseCredentials.fromCertificate(new java.io.FileInputStream(config.get("firebase:accountKey")))
        )
        .setDatabaseUrl(config.get("firebase:databaseUrl"))
        .build();

    return FirebaseApp.initializeApp(options);
});

/**
 * Verifies the user token.
 */
exports.verifyIdToken = function(idToken, successCbk, failureCbk) {
    if (typeof successCbk !== "function" || typeof failureCbk !== "function") {
        throw new TypeError("successCbk and failureCbk must be of type function!");
    }

    const listener = new JavaEventEmitter([OnSuccessListener, OnFailureListener]);

    listener.on("success", function(decodedToken) {
        successCbk(decodedToken);
    });

    listener.on("failure", function() {
        failureCbk();
    });

    FirebaseAuth.getInstance().verifyIdToken(idToken)
        .addOnFailureListener(listener.impl)
        .addOnSuccessListener(listener.impl);
};
