import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { Buffer } from 'buffer';

export const POST = async (req:Request) => {
    try{
        const { file, title, courseId } = await req.json(); 
        if (!file || !title || !courseId) {
            return NextResponse.json({message:"invalid data"},{status:400})
        }
        const pdfBuffer = Buffer.from(file, 'base64');
        await connectToDatabase()
        const newPdf = await prisma.pDF.create({data:{content: pdfBuffer, title, courseId}})
        return NextResponse.json({newPdf},{status:200})
    }catch(error){
        console.log(error)
        return NextResponse.json({message:"internal server error"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}

export const GET = async () => {
    try{
        await connectToDatabase()
        const pdfs = await prisma.pDF.findMany()
        const pdfsBase64 = pdfs.map(pdf => ({...pdf, content: pdf.content.toString('base64')}))
        return NextResponse.json({pdfs: pdfsBase64},{status:200})
    }catch(error){
        console.log(error)
        return NextResponse.json({message:"internal server error"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}