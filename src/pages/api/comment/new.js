import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { connectDB } from "@/util/db";

// api/comment/new 로 요청하면 받을 API서버(node.js 기반)
export default async function handler(req,res){
    // POST 방식으로 요청이 들어오면 
    if(req.method == 'POST'){
        console.log(req.body);          // 프론트에서 어떤 메세지를 보내왔는지?

        let reqObject = JSON.parse(req.body);
        console.log(reqObject);

        // 현재 로그인한 정보 (로그인 안되어있으면 session == null)
        let session = await getServerSession(req,res,authOptions)
        console.log(session)


        // 댓글을 DB에 저장
        // 1. 댓글내용 2. 게시글ID 3. 사용자의 이메일
        // mydb 데이터베이스 안에 comment 컬렉션(폴더)로 저장 
        if(session !== null){
            // 로그인 상태가 맞다면 
            let insertItem = {
                content : reqObject.comment,
                parent : ObjectId.createFromHexString(reqObject.boardId),
                email: session.user?.email
            }
            try{
            // insertOne
            const db = (await connectDB).db('mydb')
            let result = await db.collection('comment').insertOne(insertItem);
            console.log('댓글입력완료')
            res.status(200).json(insertItem)
            }catch(error){
                console.log('댓글입력실패 : ',error);
                res.status(500).json({error:error})
            }
        }else{
            res.status(400).json({error:'로그인이 안되어있습니다.'});
        }

        // res.status(200).json({msg:'받았음'})       
    }
}