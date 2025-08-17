import { z} from 'zod'

export const ProjectSchema  =  z.object({
    name:z.string().min(3,'Minimum Length should be 3'),
    description:z.string().nonempty(),
})