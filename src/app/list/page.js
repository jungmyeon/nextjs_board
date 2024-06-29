import { connectDB } from "@/util/db";
import Link from "next/link";
import ListItem from "./listItem";

export default async function ListPage() {
  // await 쓰려면 async function
  const db = (await connectDB).db("mydb"); // 데이터베이스 이름
  let result = await db.collection("post").find().toArray(); // 폴더이름

  // _id를 문자열로 변환
  result = result.map(item=>({
    ...item, _id: item._id.toString(),
  }));

  return (
    <div className="list-bg">
      <ListItem result={result}/>
    </div>
  );
}

// 삭제하기 버튼을 누르면 state를 변경해서 화면을 갱신 
// page.js의 기본값은 'use server' : 서버 컴포넌트
// onClick, useState, ... : 클라이언트 컴포넌트 'use client' 
// 클라이언트 함수가 필요한 부분은 컴포넌트로 분리
