import express from 'express'
import cors from 'cors'

const app = express()

app.use(express.json({ limit: '1mb' }))
app.use(cors({
    origin: ['http://localhost:5173/', 'http://localhost:3000/']
}))

import { userRouter } from './routes/user.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { vehicleRouter } from './routes/vehicle.routes.js'
import { riderRouter } from './routes/rider.routes.js'

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/rider', riderRouter)
app.use('/api/v1/vehicle', vehicleRouter)


app.get("/api/test", (req, res) => {
    res.send("hello from fatima");
})

export { app }