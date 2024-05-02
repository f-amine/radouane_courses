import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export const POST = async (req:Request) => {
    try{
        const {  url ,title ,courseId} = await req.json(); 
        if (!url || !title || !courseId) {
            return NextResponse.json({message:"invalid data"},{status:400})
        }
        await connectToDatabase()
        const newPdf = await prisma.pDF.create({data:{url,title,courseId}})
        return NextResponse.json({newPdf},{status:200})
    }catch(error){
        console.log(error)
        return NextResponse.json({message:"internal server error"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}