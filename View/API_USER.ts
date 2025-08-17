import { Router } from "express";

import { AuthorizeUser } from "../Middleware/Middleware";
import { createUser, DestroyUser, getUsers } from "../Controller/API_USER/Index";


const APIRouter = Router();

// Register route

APIRouter.post('/api-user/create',AuthorizeUser,createUser)
APIRouter.delete('/api-user/destroy/:api_id',AuthorizeUser,DestroyUser)
APIRouter.get('/api-user/get-all',AuthorizeUser,getUsers)


export default APIRouter;
