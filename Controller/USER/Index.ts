import { Request, Response } from "express";
import { ThrowError } from "../../utils/Error";
import { pool } from "../../utils/DB";

import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken'
import { userSchemaRegister } from "./validator";


const register = async (req: Request, res: Response) => {
    try {
        const { Name, Email, Password } = req.body

        userSchemaRegister.parse({Name,Email,Password})

        if (!Name || !Email) {
            throw new Error("Please Enter Name And Email")
        }

        const query = `select * from "user" where email=$1`

        const user = await pool.query(query, [Email])

        if (user.rows.length > 0) {
            throw new Error('Email already registered')
        }

        const pin = Math.floor(Math.random() * 99999) + 10000

        const hashed = await bcrypt.hash(Password, 10)

        const newInsertQuery = `insert INTO "user" (Name,Email,Password,Pin) VALUES ($1,$2 ,$3,$4)`

        const insertUser = await pool.query(newInsertQuery, [Name, Email, hashed, pin])

        const newUser = insertUser.rows[0]

        const token = jwt.sign(
            { id: newUser.id },
            process.env.LOGIN_SECRET!,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            data: newUser,
            Token: token
        })
    } catch (error) {
        ThrowError(res, error)
    }
}


const Login = async (req: Request, res: Response) => {
    try {
        const { Email, Password } = req.body

        


    } catch (error) {
        ThrowError(res, error)
    }
}

const verifyEmailRequest = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        ThrowError(res, Error)
    }
}