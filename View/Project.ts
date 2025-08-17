import { Router } from "express";

import { AuthorizeUser } from "../Middleware/Middleware";
import { Create, Delete, getProject, Read, Update } from "../Controller/Projects/Index";



const ProjectRouter = Router();



 ProjectRouter.post('/create-project',AuthorizeUser,Create)
 ProjectRouter.get('/get-projects',AuthorizeUser,Read)
 ProjectRouter.put('/update-project/:id',AuthorizeUser,Update)
 ProjectRouter.get('/get-project/:id',AuthorizeUser,getProject)
 ProjectRouter.delete('/delete-project/:id',AuthorizeUser,Delete)




export default ProjectRouter 
;
