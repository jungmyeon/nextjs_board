import { connectDB } from "@/util/db";
import { ObjectId } from "mongodb";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

// /api/delete/list_item으로 요청이 들어오면 동작할 함수 
export default async function handler(req,res){
    console.log(req.body);
    
    if(req.method == 'DELETE'){
        try{
            let {id, email} = req.body;         // 글목록의 정보 
            let session = await getServerSession(req, res, authOptions);

            if(session?.user?.email === email || session?.user?.email === 'admin123@admin.com'){
            const db = (await connectDB).db("mydb"); // 데이터베이스 이름
            let result = await db.collection("post").deleteOne({_id: ObjectId.createFromHexString(id)}); // 폴더이름
            res.status(200).json({msg:'삭제완료'});
        }else{   // 클라이언트 요청 오류 400
                res.status(400).json({error:'삭제는 글 작성자만 할 수 있습니다'});
            }
        }catch(error){
            // 서버 기능 오류 500
            res.status(500).json({msg:'서버기능오류: ' + error})
        }
    }else{
        // 클라이언트 실수 (400 ~ 405)
        res.status(405).json({msg:'DELETE 요청만 처리합니다'});
    }
}

// find().toArray() : 다 가져와
// findOne() : 하나만 가져와 
// updateOne() : 하나 수정해
// deleteOne() : 하나 삭제해 
