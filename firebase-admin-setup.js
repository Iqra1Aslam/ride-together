import {initializeApp, applicationDefault } from 'firebase-admin/app';
import serviceAccount from './push-notification-6f275-5fe46dc0eeae.json' assert { type: 'json' };
process.env.GOOGLE_APPLICATION_CREDENTIALS;

initializeApp({
    credential: admin.credential.cert(serviceAccount)
 
});


