import connectToDatabase from "@/lib/dbConnect";
import { NextResponse } from "next/server";


export async function GET(req, res) {
    try {
        console.log("about to connect...");
        await connectToDatabase();
        console.log("connect to database.");
        return NextResponse.json({ message: "database connected" });
    } catch(error) {
        console.log(error);
        return NextResponse.json({ error: "something went wrong." });
    }
}