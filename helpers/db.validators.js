// Validaciones en relacion a la bd 

import User from "../src/user/user.model.js";
// import Category from "../src/category/category.model.js"

export const existUserName = async (username) => {
    const alreadyUsername = await User.findOne({username: username})
    if(alreadyUsername){
        console.error(`Username ${username} is already taken`)
        throw new Error(`Username ${username} is already taken`)
    }
}

export const existCategoryName = async (name) => {
    const alreadyExists = await Category.findOne({ name });

    if (alreadyExists) {
        console.error(`Category ${name} already exists`);
        throw new Error(`Category ${name} already exists`);
    }
};
