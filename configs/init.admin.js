'use strict'
import { encrypt } from "../utils/encrypt.js"
import User from "../src/user/user.model.js"

export const initializeAdminUser = async () => {
    try {
       const adminExist = await User.findOne({role: "ADMIN" })
       if(!adminExist){
        const AdminUser = new User({
            name: "Christopher",
            surname: "Barrera",
            username: "chris06",
            email: "cbarrera-2020306@kinal.edu.gt",
            password: await encrypt("2025Kinal!"),
            phone: "09218734",
            role: "ADMIN"
        })
        await AdminUser.save()
        console.log("Admin succesfully created")
       }else{
           console.log("Admin altready exist")
       }

    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with registering user', err})
    }
}