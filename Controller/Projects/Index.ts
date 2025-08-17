import { Request, Response } from 'express'
import { ThrowError } from '../../utils/Error'
import { ProjectSchema } from './Validator'
import cloudinary from '../../utils/Cloudinary'
import { pool } from '../../utils/DB'

export const Create = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body
        // ProjectSchema.parse({ name, descrption })

        const id = (req as any).user.id

        let data = req.body


        let imageNew = ''




        if ((req as any).files) {
            const image = (req as any).files.image

            const result = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: 'projects'
            })

            imageNew = result.secure_url

            const publicId = result.public_id

            const query = `INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 , $2) RETURNING *`

            const insert = await pool.query(query, [publicId, result.secure_url])
        }

        const values = [
            data?.name,                               // name (NOT NULL)
            imageNew || "",                        // image
            data?.github || "",                       // github
            data?.live || "",                         // live
            data?.description || "",                  // description
            data?.reason || "",                        // reason
            data?.isspecial ?? false,                 // isspecial (boolean)
            data?.techstacks? JSON.parse(data?.techstacks) : [],                // techstacks (array)
            id                                // uid (NOT NULL)
        ];

        // Query string with numbered placeholders
        const query = `INSERT INTO project (name, image, github, live, description, reason, isspecial, techstacks, uid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

        // Execute
        const allData = await pool.query(query, values);

        return res.status(200).json({
            data: allData.rows[0]
        })
    } catch (error) {
        ThrowError(res, error)
    }
}
export const Read = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user.id

        const query = `SELECT * FROM "project" WHERE "uid" = $1`

        const { rows } = await pool.query(query, [id])

        return res.status(200).json({
            data: rows
        })
    } catch (error) {
        ThrowError(res, error)
    }
}
export const Update = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body
        // ProjectSchema.parse({ name, descrption })

        const id = (req as any).user.id

        const projectId = req.params.id;

        const { rows: ProjectData } = await pool.query(`SELECT * FROM "project" WHERE id=$1 AND uid= $2`, [projectId, id])

        const thisProject = ProjectData[0]

        let data = req.body


        let imageNew = ''



        if ((req as any).files) {
            const image = (req as any).files.image

            const result = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: 'projects'
            })

            imageNew = result.secure_url

            const publicId = result.public_id

            const query = `INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 , $2) RETURNING *`

            const insert = await pool.query(query, [publicId, result.secure_url])

            const imageLink = thisProject.image

            if (imageLink) {
                const { rows: fileRows } = await pool.query(`SELECT * FROM "file" WHERE "Link" = $1`, [imageLink])

                const imageData = fileRows[0]

                await cloudinary.uploader.destroy(imageData.Public_ID)

                await pool.query('DELETE FROM "file" WHERE "Link" = $1', [imageLink])
            }
        } else {
            const imageLink = thisProject.image

            if (imageLink) {
                const { rows: fileRows } = await pool.query(`SELECT * FROM "file" WHERE "Link" = $1`, [imageLink])

                const imageData = fileRows[0]

                await cloudinary.uploader.destroy(imageData.Public_ID)

                await pool.query('DELETE FROM "file" WHERE "Link" = $1', [imageLink])
            }
        }

        const values = [
            data?.name,                               // name (NOT NULL)
            imageNew || data?.image || "",                        // image
            data?.github || "",                       // github
            data?.live || "",                         // live
            data?.description || "",                  // description
            data?.reason || "",                        // reason
            data?.isspecial ?? false,                 // isspecial (boolean)
            data?.techstacks? JSON.parse(data?.techstacks) : [],                    // techstacks (array)
            id                                // uid (NOT NULL)
        ];

        // Query string with numbered placeholders
        const query = `UPDATE project SET name = $1, image = $2, github = $3, live = $4, description = $5, reason = $6, isspecial = $7, techstacks = $8 WHERE uid = $9 RETURNING *;
`;

        // Execute
        const allData = await pool.query(query, values);

        return res.status(200).json({
            data: allData.rows[0]
        })

    } catch (error) {
        ThrowError(res, error)
    }
}
export const Delete = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user.id; // user id from auth middleware
        const projectId = req.params.id; // assuming route is /delete/:id

        const query = `DELETE FROM "project" WHERE id=$1 AND uid=$2 RETURNING *`;

        const { rows } = await pool.query(query, [projectId, id]);

        if (rows.length <= 0) {
            throw new Error("Hey Is This Valid");
        }

        if (rows[0].image) {
            const imageQuery = `SELECT * FROM "file" WHERE "Link" = $1 `

            const { rows: Images } = await pool.query(imageQuery, [rows[0].image])

            const deletePhoto = await cloudinary.uploader.destroy(Images[0].Public_ID)

            const imageDeleteQuery = `DELETE FROM "file" WHERE "Link" = $1 `

            await pool.query(imageDeleteQuery, [rows[0].image])


        }

        return res.status(200).json({
            message: "Project deleted successfully",
            deleted: rows[0]
        });
    } catch (error) {
        ThrowError(res, error);
    }
};


export const getProject = async (req: Request, res: Response) => {
    try {
        const id = (req as any).user.id

        const projectId = req.params.id

        const query = `Select * FROM "project" where id=$1 AND uid=$2`

        const { rows } = await pool.query(query, [projectId, id])

        if (rows.length <= 0) {
            throw new Error('Hey Is This Valid')
        }

        return res.status(200).json({
            data: rows[0]
        })
    } catch (error) {
        ThrowError(res, error)
    }
}