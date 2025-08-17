import { z} from 'zod'

export const userSchemaRegister  =  z.object({
    Name:z.string().min(3,'Minimum Length should be 3'),
    Password:z.string().min(8,'Password Should be of Min 8 character'),
    Email:z.string().email()
})
export const userSchemaLogin  =  z.object({
    Password:z.string().min(8,'Password Should be of Min 8 character'),
    Email:z.string().email()
})