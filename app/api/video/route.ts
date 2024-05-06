import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { url, title, courseId } = body; 

        if (!url || !title || !courseId) {
            console.log("invalid data");
            return NextResponse.json({message: "invalid data"}, {status: 400});
        }

        await connectToDatabase()
        const newVideo = await prisma.video.create({
            data: {
                url,
                title,
                courseId
            }
        })

        return NextResponse.json({newVideo}, {status: 200})
    } catch(error) {
        console.log(error)
        return NextResponse.json({message: "internal server error"}, {status: 500})
    } finally {
        await prisma.$disconnect()
    }
}