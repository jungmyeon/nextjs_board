/* 
    localhost:3000/api/post/new로 요청하면 이 서버 파일이 실행
*/

import { connectDB } from "@/util/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function writeHandler(req, res)
{
    // POST 요청에는 body라는 곳에 데이터를 담아보냄 (req.body에 input으로 입력한 것들이 있음)
    //console.log(req.body);
    let session = await getServerSession(req, res, authOptions);    // 로그인 정보
    // console.log(session);

    if(req.method == 'POST'){
        //body에 담긴 값들을 꺼내고
        // 비어있지 않으면
        // mongodb에 insertOne 입력
        // 리스트 페이지로 돌려보내기 (302, "URL")
        let {title, content} = req.body;
        if(session){
            req.body.email = session.user?.email;   // user? : session안에 user가 없을수도 있으니까
        }

        if(title && content && req.body.email){
            try{
                // 이 코드를 실행
                const email = req.body.email;
                const db = (await connectDB).db("mydb"); 
                let result = await db.collection("post").insertOne({title, content, email});    // 제목,내용,이메일
                return res.redirect(302,'/list');         // 끝나면 /list 페이지로 이동시키기 
            }catch(error){
                // try 코드를 실행하다 에러나면 이쪽으로 즉시 이동
                console.log('Database Error: ',error);
                return req.status(500).json({error: '서버기능 오류'});
            }
        }else{
            // 빈칸으로 입력햇 요청했을때 (사용자 실수)
            return req.status(400).json({error: '서버기능 오류'})
        }
    }else{
        return res.status(405).json({error:'Method Not Allowed'})   // POST요청 외에는 에러처리
    }
}

