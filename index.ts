import express, { Application, Request, Response } from 'express'

import dotenv from 'dotenv'
import { connectDB } from './utils/DB'


dotenv.config()


import cors from 'cors'

const app: Application = express()
const PORT = process.env.PORT || 3000

app.use((req, res, next) => {
    if (req.path.startsWith('/portfolio/')) {
        next()
    } else {
        cors({
            origin: 'https://localhost:5173', // Your frontend URL
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        })(req, res, next)
    }
})



app.use(express.json())



// Routes

// Default route
app.get('/awake ', (req: Request, res: Response) => {
    res.send('Hello TypeScript + Express!')
})

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
    })
})
