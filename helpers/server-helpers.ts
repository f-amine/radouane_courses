import prisma from "@/prisma"
import { CloudCog } from "lucide-react";

export const connectToDatabase = async () =>{
    try{
        await prisma.$connect();

    }catch(error){
        
        throw new Error("unable to connect to database")
    }}