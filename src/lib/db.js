import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connection successfull with DB")
    } catch (error) {
        console.log("Conection error in DB")
    }
}