import { connect } from 'mongoose'
import admin from 'firebase-admin'
import {initializeApp, applicationDefault } from 'firebase-admin/app';
import serviceAccount from '../../push-notification-6f275-5fe46dc0eeae.json' assert { type: 'json' };
process.env.GOOGLE_APPLICATION_CREDENTIALS;
initializeApp({
    credential: admin.credential.cert(serviceAccount)
 
});
export const connectDB = async () => {
    try {
        await connect(process.env.DB_URI)
            .then(info => console.log('DB Connected'))
    } catch (error) {
        console.log(`DB Connection ERROR: ${error.message}`)
    }
}