'use client'

import Link from "next/link";
import { useState } from "react";

// 'use client' 가 적혀있어야
// onClick, useState 등 사용가능

// 클라이언트 컴포넌트 분리
// DB에서 받아온 result 값을 useState로 관리
export default function ListItem({result}){
    // 받아온 데이터를 state로 변경 (화면 갱신을 위해서)
    const [listData, setListData] = useState(result);
    console.log('리스트정보 : ',result)
    return(
        <>
            {listData && listData.length > 0 ? listData.map((item, index) => 
          {
            return (
              <div key={index} className="list-item">
                <Link href={'/detail/' + item._id}>
                <h4>{item.title}</h4>
                <p>{item.content}</p>
                </Link>
                <Link href={"/edit/" + item._id}>✏️수정</Link>
                <span onClick={()=>{
                    fetch('/api/delete/list_item',{
                        method: 'DELETE', 
                        headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({id:item._id, email:item.email})
                    })
                    .then((res)=>{
                        // fetch가 완료되면 실행할 코드 (res)에는 서버응답이 담겨있음
                        // 'use client' 에서 console.log()를 하면 웹페이지에서 확인 가능 
                        if(res.status == 200){
                            // 기존의 listData에서 item._id가 일치하는 id를 찾아 filter
                            // filter() : 입력한 값을 배열에서 찾아 걸러줌
                            setListData(prev => prev.filter((i)=>i._id !== item._id));
                            return res.json();      // then 에서 return을 하면 다음 then의 매개변수로 옮겨감
                        }else if(res.status == 400){
                            alert('글 작성자만 삭제할 수 있습니다');
                            return res.json();
                        }
                            else{
                            // 200 성공이 아닐때 
                            return res.json();
                        }
                    })
                    .then((resJson)=>{
                        console.log(resJson);
                    })
                    .catch((error)=>{
                        console.log(error);     // fetch나 then을 하다가 예외상황이 발생하면 .catch 실행
                    })
                }}>🗑️삭제</span>
                
              </div>
            );
          }) : null}
        </>
    )
}
