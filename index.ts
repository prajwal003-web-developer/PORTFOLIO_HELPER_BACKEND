import express, { Application, Request, Response } from 'express'

import dotenv from 'dotenv'
import { connectDB } from './utils/DB'

import fileUpload from 'express-fileupload';


dotenv.config()

import router from './View/User'


import cors from 'cors'
import APIRouter from './View/API_USER'
import ProjectRouter from './View/Project';
import UserDataRouter from './View/UserDetails';

const app: Application = express()
const PORT = process.env.PORT || 3000



app.use(fileUpload({ useTempFiles: true, tempFileDir: './tmp/' }));

app.use((req, res, next) => {
   
        cors({
            origin: ['http://localhost:3000',process.env.FRONTEND_URL!], // Your frontend URL
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        })(req, res, next)
})



app.use(express.json())



// Routes

// Default route
app.get('/awake ', (req: Request, res: Response) => {
    res.send('Hello TypeScript + Express!')
})

app.use('/api/auth', router)

app.use('/api', APIRouter)

app.use('/api', ProjectRouter)

app.use('/api', UserDataRouter)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
    })
})
