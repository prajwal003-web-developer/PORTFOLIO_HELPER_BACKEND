import { Request, Response } from "express";
import { ThrowError } from "../../utils/Error";
import { pool } from "../../utils/DB";
import cloudinary from "../../utils/Cloudinary";
import path from "path";

// POST/PUT - Add or Update Information
export const ManageInfo = async (req: Request, res: Response) => {
    try {
        const uid = (req as any).user?.id;
        if (!uid) throw new Error("User ID missing");

        const { rows } = await pool.query(
            `SELECT * FROM "information" WHERE uid = $1`,
            [uid]
        );

        const data = req.body; // Make sure frontend sends all required fields

        if (rows.length === 0) {
            // Insert new
            const insertQuery = `
        INSERT INTO "information" (
          uid, name, title, homeimage, aboutimage, about, skills, resume, contact, whatsapp,
          facebook, github, email, instagram, twitter, linkedin
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16
        ) RETURNING *;
      `;

            let HomeImage, AboutImage, Resume

            if ((req as any).files) {
                const Home = (req as any).files?.homeimage
                const About = (req as any).files?.aboutimage
                const ResumeData = (req as any).files?.resume




                if (Home) {
                    const result = await cloudinary.uploader.upload(Home.tempFilePath, {
                        folder: 'Image'
                    })

                    HomeImage = result.secure_url

                    await pool.query(`INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 ,$2)`, [result.public_id, result.secure_url])
                }

                if (About) {
                    const result = await cloudinary.uploader.upload(About.tempFilePath, {
                        folder: 'Image'
                    })

                    AboutImage = result.secure_url

                    await pool.query(`INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 ,$2)`, [result.public_id, result.secure_url])
                }

                if (ResumeData) {
                    const result = await cloudinary.uploader.upload(ResumeData.tempFilePath, {
                        folder: 'Resumes',
                        resource_type: 'raw',
                        use_filename: true,
                        unique_filename: true,
                        public_id: `Resume_${Date.now()}.${path.extname(ResumeData.name)}`
                    })

                    Resume = result.secure_url

                    await pool.query(`INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 ,$2)`, [result.public_id, result.secure_url])
                }
            }
            const insertValues = [
                uid,
                data.name,
                data.title || "",
                HomeImage || "",
                AboutImage || "",
                data.about || "",
                data.skills ? JSON.parse(data.skills) : [],
                Resume || "",
                data.contact || "",
                data.whatsapp || "",
                data.facebook || "",
                data.github || "",
                data.email || "",
                data.instagram || "",
                data.twitter || "",
                data.linkedin || ""
            ];

            const result = await pool.query(insertQuery, insertValues);
            return res.status(201).json({ message: "Information added", data: result.rows[0] });

        } else {
            // Update existing
            const updateQuery = `
        UPDATE "information" SET
          name = $1, title = $2, homeimage = $3, aboutimage = $4, about = $5,
          skills = $6, resume = $7, contact = $8, whatsapp = $9,
          facebook = $10, github = $11, email = $12, instagram = $13,
          twitter = $14, linkedin = $15
        WHERE uid = $16
        RETURNING *;
      `;

            let HomeImage, AboutImage, Resume


            if ((req as any).files) {
                const Home = (req as any).files?.homeimage
                const About = (req as any).files?.aboutimage
                const ResumeData = (req as any).files?.resume

                const Data = rows[0]

                if (Home) {
                    const result = await cloudinary.uploader.upload(Home.tempFilePath, {
                        folder: 'Image'
                    })

                    HomeImage = result.secure_url

                    await pool.query(`INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 ,$2)`, [result.public_id, result.secure_url])

                    if (Data.homeimage) {
                        const { rows: isImageThere } = await pool.query(`SELECT * FROM "file" WHERE "Link" = $1`, [Data.homeimage])

                        const deleteData = await cloudinary.uploader.destroy(isImageThere[0].Public_ID)


                        await pool.query(`DELETE FROM "file" WHERE "Link" = $1 `, [isImageThere[0].Link])
                    }

                }

                if (About) {
                    const result = await cloudinary.uploader.upload(About.tempFilePath, {
                        folder: 'Image'
                    })

                    AboutImage = result.secure_url

                    await pool.query(`INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 ,$2)`, [result.public_id, result.secure_url])

                    if (Data.aboutimage) {
                        const { rows: isImageThere } = await pool.query(`SELECT * FROM "file" WHERE "Link" = $1`, [Data.aboutimage])

                        const deleteData = await cloudinary.uploader.destroy(isImageThere[0].Public_ID)

                        console.log('here')

                        await pool.query(`DELETE FROM "file" WHERE "Link" = $1 `, [isImageThere[0].Link])
                    }
                }

                if (ResumeData) {
                    const result = await cloudinary.uploader.upload(ResumeData.tempFilePath, {
                        folder: 'Resumes',
                        resource_type: 'raw',
                        use_filename: true,
                        unique_filename: true,
                        public_id: `Resume_${Date.now()}.${path.extname(ResumeData.name)}`
                    })

                    Resume = result.secure_url

                    await pool.query(`INSERT INTO "file" ("Public_ID" , "Link") VALUES ($1 ,$2)`, [result.public_id, result.secure_url])

                    if (Data.resume) {
                        const { rows: isImageThere } = await pool.query(`SELECT * FROM "file" WHERE "Link" = $1`, [Data.resume])

                        const deleteData = await cloudinary.uploader.destroy(isImageThere[0].Public_ID)

                        await pool.query(`DELETE FROM "file" WHERE "Link" = $1 `, [isImageThere[0].Link])
                    }
                }
            }
            const updateValues = [
                data.name,
                data.title || "",
                HomeImage || data.homeimage || "",
                AboutImage || data.aboutimage || '',
                data.about || "",
                data.skills ? JSON.parse(data.skills) : [],
                Resume || data.resume || "",
                data.contact || "",
                data.whatsapp || "",
                data.facebook || "",
                data.github || "",
                data.email || "",
                data.instagram || "",
                data.twitter || "",
                data.linkedin || "",
                uid
            ];

            const result = await pool.query(updateQuery, updateValues);
            return res.status(200).json({ message: "Information updated", data: result.rows[0] });
        }
    } catch (error) {
        ThrowError(res, error);
    }
};

// GET - Get Information by UID
export const GetInfo = async (req: Request, res: Response) => {
    try {
        const uid = (req as any).user?.id;
        if (!uid) throw new Error("User ID missing");

        const { rows } = await pool.query(
            `SELECT * FROM "information" WHERE uid = $1`,
            [uid]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No information found" });
        }

        return res.status(200).json({ data: rows[0] });
    } catch (error) {
        ThrowError(res, error);
    }
};
