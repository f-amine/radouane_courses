import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { URL } from "url";

export const POST = async (req:Request) => {
    try{
        const body = await req.json();
        const {  name ,description,is_sup,level,language,is_premium} = body; 
        if (!name || !description || is_sup === undefined || level === undefined || !language || is_premium === undefined) {
            console.log("invalid data");
            return NextResponse.json({message: "invalid data"}, {status: 400});
        }
        await connectToDatabase()
        const newCourse = await prisma.course.create({data:{name,description,is_sup,level,language,is_premium}})
        return NextResponse.json({newCourse},{status:200})
    }catch(error){
        console.log(error)
        return NextResponse.json({message:"internal server error"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}
export const GET = async (req: Request) => {
    const baseurl = new URL(req.url);

    const cursor = baseurl.searchParams.get('cursor'); 
    const pageSize = parseInt(baseurl.searchParams.get('pageSize') || '10', 10);
    const isPremium = baseurl.searchParams.get('is_premium');
    const language = baseurl.searchParams.get('language');
    const isSup = baseurl.searchParams.get('is_sup');
    const name = baseurl.searchParams.get('name');
    const level = baseurl.searchParams.get('level');
    try {
        await connectToDatabase();
        const courses = await prisma.course.findMany({
            take: pageSize + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { id: 'desc' }, 
            where: {
                is_premium: isPremium ? JSON.parse(isPremium) : undefined,
                language: language ? language : undefined,
                is_sup: isSup ? JSON.parse(isSup) : undefined,
                name: name ? { contains: name } : undefined,
                level: level ? level : undefined
            },
            include: {
                videos: true,
                PDFs: true 
            }
        });
        const hasNextPage = courses.length > pageSize;
        const nextCursor = hasNextPage ? courses[pageSize].id : null; 
        if (hasNextPage) courses.pop();

        return NextResponse.json({ courses, hasNextPage, nextCursor }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};