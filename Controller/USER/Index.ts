import { Request, Response } from "express";
import { ThrowError } from "../../utils/Error";
import { pool } from "../../utils/DB";

import nodemailer from "nodemailer";

import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken'
import { userSchemaLogin, userSchemaRegister } from "./validator";
import { userData } from "./user.model";


export const register = async (req: Request, res: Response) => {
    try {
        const { Name, Email, Password } = req.body

        const result = userSchemaRegister.safeParse({ Name, Email, Password })

        if (!result.success) {
            throw new Error(result.error.message)
        }

        const query = `select * from "user" where "Email"=$1`

        const user = await pool.query(query, [Email])

        if (user.rows.length > 0) {
            throw new Error('Email already registered')
        }

        const pin = Math.floor(Math.random() * 99999) + 10000

        const hashed = await bcrypt.hash(Password, 10)

        const TokenForVisiting = jwt.sign({ Email}, process.env.OTHER_SECRET! )

        const newInsertQuery = `insert INTO "user" ("Name","Email","Password","Pin" ,"Token") VALUES ($1,$2 ,$3,$4,$5) RETURNING id ,"Name" , "Email" , "IsVerified"`

        const insertUser = await pool.query(newInsertQuery, [Name, Email, hashed, pin,TokenForVisiting])

        const newUser = insertUser.rows[0].id

        const token = jwt.sign(
            { id: newUser },
            process.env.LOGIN_SECRET!,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            Token: token,
            user:insertUser.rows[0]
        })
    } catch (error) {
        ThrowError(res, error)
    }
}


export const Login = async (req: Request, res: Response) => {
    try {
        const { Email, Password } = req.body

        userSchemaLogin.parse({ Email, Password })

        const query = `select * from "user" where "Email"=$1`

        const { rows } = await pool.query(query, [Email])

        if (rows.length == 0) {
            throw new Error("Sorry email is not registered")
        }

        const user = rows[0]

        const isVerified = await bcrypt.compare(Password, user.Password)

        if (!isVerified) {
            throw new Error("Password is Wrong")
        }

        const token = jwt.sign({ id: user.id }, process.env.LOGIN_SECRET!, {
            expiresIn: '7d'
        })

        return res.status(200).json({
            message: "Login succesful",
            Token: token,
            data: {
                Name:user.Name ,
                Email:user.Email,
                isVerified:user.IsVerified,
                Token:user.Token,
                id:user.id
            }
        })


    } catch (error) {
        ThrowError(res, error)
    }
}

export const verifyEmailRequest = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user?.id

        const queryToGetUser = `select * from "user" where "id" = $1`

        const { rows } = await pool.query(queryToGetUser, [id])

        if (rows.length == 0) {
            throw new Error("User is Not available")
        }

        const user: userData = rows[0]

        const pin = user.Pin

        const token = jwt.sign({ pin: pin, userId: id }, process.env.EMAIL_SECRET!, { expiresIn: '20min' })


        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });


        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

        const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
      <h2>Email Verification</h2>
      <p>Hi,</p>
      <p>Thanks for registering! Please verify your email by clicking the button below:</p>
      <a href="${verifyLink}" 
         style="display:inline-block; padding:10px 20px; margin:20px 0; background-color:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
         Verify Email
      </a>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p>${verifyLink}</p>
      <p>Cheers,<br/>Your Company</p>
    </div>
  `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.Email,
            subject: "Verify Your Email",
            html,
        })



        return res.status(200).json({
            message: "Email Sent Succesfully"
        })



    } catch (error) {
        ThrowError(res, Error)
    }
}

export const me = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user?.id

        const queryToGetUser = `select "Name" ,"Email","Token","IsVerified","id" from "user" where "id" = $1`

        const { rows } = await pool.query(queryToGetUser, [parseInt(id)])

        if (rows.length == 0) {
            throw new Error("User is Not available")
        }

        const user: userData = rows[0]

        return res.status(200).json({
            data: user
        })
    } catch (error) {
        ThrowError(res, error)
    }
}

export const verify = async (req: Request, res: Response) => {
    try {


        const { Token } = req.body

        const queryToGetUser = `select * from "user" where "id" = $1`

        const payload = jwt.verify(Token, process.env.EMAIL_SECRET!) as { userId: number, pin: number }

        const id = payload.userId

        const { rows } = await pool.query(queryToGetUser, [id])

        if (rows.length == 0) {
            throw new Error("User is Not available")
        }

        const user: userData = rows[0]

        const pin = user.Pin



        if (pin !== payload.pin) {
            throw new Error("Pin Mismatched")
        }

        const query = `UPDATE "user" SET "IsVerified" = $1 WHERE "id" = $2 RETURNING *;`;
        const values = [true, id];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            throw new Error('Cant verify')
        }

        return res.status(200).json({
            message: "verified"
        })

    } catch (error) {
        ThrowError(res, error)
    }
}