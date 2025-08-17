import { Request, Response } from 'express'
import { ThrowError } from '../../utils/Error'
import { pool } from '../../utils/DB'

export const createUser = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user?.id
        const { username, password } = req.body

        if(!username || !password){
            throw new Error("Failed with Error Name and Password required")
        }

        if(username.length<4){
            throw new Error("Failed with Error username should be minimum 4 char")
        }
        if(password.length<6){
            throw new Error("Failed with Error username should be minimum 6 char")
        }

        const query = `INSERT INTO "api_user"("username", "password", "uid") VALUES($1, $2, $3) RETURNING id, username, password;`

        const data = await pool.query(query, [username, password, id])

        return res.status(200).json({
            message: "Succesfull",
            data: data?.rows[0]
        })
    } catch (error) {
        ThrowError(res, error)
    }
}
export const DestroyUser = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user?.id

        const { api_id } = req.params

        const query = `Delete FROM "api_user" WHERE "id"=$1 AND "uid"=$2 `
       

        const deleteData = await pool.query(query, [api_id, id])

        if (deleteData.rowCount === 0 || !deleteData.rowCount) {
            throw new Error("No Data Effected")
        }

        return res.status(200).json({
            message: "Succesfull",
        })
    } catch (error) {
        ThrowError(res, error)
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user?.id

        const query = `select * FROM "api_user" WHERE "uid"=$1`

        const {rows} = await pool.query(query,[id])

        return res.status(200).json({
            data:rows
        })
    } catch (error) {
        ThrowError(res, error)
    }
}