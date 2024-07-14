import { connect } from 'mongoose'

export const connectDB = async () => {
    try {
        await connect(process.env.DB_URI)
            .then(info => console.log('DB Connected'))
    } catch (error) {
        console.log(`DB Connection ERROR: ${error.message}`)
    }
}