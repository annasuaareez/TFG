const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/* eslint-disable */
/* global exports, require */
exports.disableUser = functions.https.onCall(async (data, context) => {
    // Verifica que el usuario que llama sea un administrador
    if (!context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden banear usuarios.');
    }

    const uid = data.uid;

    try {
        // Deshabilita al usuario
        await admin.auth().updateUser(uid, {
            disabled: true
        });

        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Hubo un error al deshabilitar al usuario.');
    }
});
