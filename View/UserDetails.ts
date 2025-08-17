import { Router } from "express";

import { AuthorizeUser } from "../Middleware/Middleware";
import { GetInfo, ManageInfo } from "../Controller/USER_DATA/Index";
import { dataByOthers, dataByUser } from "../Controller/DataController/Index";




const UserDataRouter = Router();



UserDataRouter.post('/manage-my-data',AuthorizeUser,ManageInfo)
UserDataRouter.get('/get-my-data',AuthorizeUser,GetInfo)


//For Portfolio
UserDataRouter.get('/get-data',AuthorizeUser,dataByUser)
UserDataRouter.get('/get-all/:token',dataByOthers)






export default UserDataRouter 
;
