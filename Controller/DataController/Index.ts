//get data for user to view only 

import { Request, Response } from "express"
import { ThrowError } from "../../utils/Error"
import { pool } from "../../utils/DB"

import jwt, { JwtPayload } from "jsonwebtoken";


interface MyPayload extends JwtPayload {
  id: number;
}


export const dataByUser = async (req: Request, res: Response) => {
    try {

        const id = (req as any).user.id

        const { rows: ProjectRows } = await pool.query(`SELECT * FROM "project" WHERE "uid" = $1`, [id])

        const Project = ProjectRows

        const { rows: DataRows } = await pool.query(`SELECT * FROM "information" WHERE "uid" = $1`, [id])

        let data = DataRows[0]


        return res.status(200).json({
            data: data,
            Project: Project
        })

    } catch (error) {
        ThrowError(res, error)
    }
}
export const dataByOthers = async (req: Request, res: Response) => {
    try {

        const token = req.params.token

        const decoded = jwt.verify(token, process.env.OTHER_SECRET!) as MyPayload;
        const { id } = decoded;

        const { rows: ProjectRows } = await pool.query(`SELECT * FROM "project" WHERE "uid" = $1`, [id])

        const Project = ProjectRows

        const { rows: DataRows } = await pool.query(`SELECT * FROM "information" WHERE "uid" = $1`, [id])

        let data = DataRows[0]


        return res.status(200).json({
            data: data,
            Project: Project
        })

    } catch (error) {
        ThrowError(res, error)
    }
} 