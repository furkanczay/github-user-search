import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), 'data/userData.json')

export async function POST(request: NextRequest) {
  console.log(dataFilePath);
  
  try {
    const body = await request.json();
    const res = await fetch(`https://api.github.com/users/${body.username}`);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: 'An error occurred' });

  }
  
}