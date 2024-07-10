import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // 구글 소셜
import GithubProvider from "next-auth/providers/github"; // 깃허브 소셜
import CredentialsProvider from "next-auth/providers/credentials"; // 내 DB 로그인
import { connectDB } from "@/util/db";
import bcrypt from 'bcrypt'       // npm install bcrypt

const googleId = process.env.google_id;
const googleSecret = process.env.google_secret;
const githubId = process.env.github_id;
const githubSecret = process.env.github_secret;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:
        googleId,
      clientSecret: googleSecret,
    }),
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    }),
    CredentialsProvider({
      // 회원가입한 아이디로 로그인 UI
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },

      // 로그인 시도 시 동작할 함수
      async authorize(credentials) {
        // mongoDB에 접속해서 해당 이메일과 비밀번호가 있는지 찾고
        // 찾았으면 그 유저정보를 return
        let db = (await connectDB).db("mydb");
        let user = await db.collection("user").findOne({ email: credentials.email }); // 이메일이 있는지 확인
        // findOne() : 조건에 맞는 것을 찾아서 object형식으로 변환/ 못찾으면 null
        if(!user){
          console.log('일치하는 아이디가 없습니다')
          return null;       // 못찾았으니 유저정보 안줌
        }

        // 비밀번호를 bcrypt로 암호화했기 떄문에 복호화해서 비교= compare
        const checkPassword = await bcrypt.compare(credentials.password, user.password)
        if(!checkPassword){
          console.log('비밀번호가 일치하지 않습니다')
          return null;      // 비밀번호 틀렸으니 유저정보 안줌
        }

        return user;        // 이메일도 찾았고 비밀번호도 맞으니까 유저정보 줌

      },
    }),
  ],
  callbacks:{
    // 로그인 방식에 따라서 다르게 처리 (웹 보안 로그인 인증방식 2가지)
    jwt: async({token, user})=>{
        // 토큰 방식 로그인 (Json Web Token 압축정보)
      if(user){
        token.user = {};
        token.user.name = user.name;
        token.user.email = user.email;
      }
      return token;     // name 과 email을 반환 
    },
    session:async({session, token})=>{
        // 세션방식 로그인 (서버에서 보관하는 사용자정보 이용)
      session.user = token.user;
      return session;
    }
  },
  // 로그인 유지 기간
  session:{
    strategy:'jwt',
    maxAge: 24 * 60 * 60    // 하루    30일 : 30 * 24 * 60 * 60     7일 : 7 * 24 * 60 * 60
  },
  secret: "anything",
};

export default NextAuth(authOptions);
// 소셜로그인 설정
// npm install next-auth
// pages 폴더안에 api 폴더 안에 auth 폴더 생성하고
// [...nextauth].js 파일을 생성
// [] : dynamic route (동적 URL) : 각 소셜로그인에서 제공하는 경로를 넣을 거임 (구글, 깃허브.페이스북 다 다름)

// 구글로그인
// https://console.cloud.google.com/ -> API 및 서비스 -> OAuth 동의 화면 (External 버튼 클릭)
// 클라이언트 ID 와 클라이언트 보안 비밀번호 메모해놓기
// 사용자 인증 정보 -> 사용자 인증정보 만들기 -> OAuth 2.0 클라이언트 생성 -> 웹 애플리케이션 선탣 -> 이름 입력 -> 승인된 리디렉션 URI 추가
// http://localhost:3000/api/auth/callback/google -> 만들기

// 깃허브로그인
// github 로그인 -> 우측 프로필 아이콘 클릭 -> Settings => Developer settings -> OAuth Apps -> Register a new application
// -> Application name 입력 -> http://localhost:3000/ 입력 (실제 사이트도 있으면 실제 사이트 URI 추가하기)
// -> Generate a new client secret 버튼 클릭
// 클라이언트ID 와 클라이언트 비밀번호 메모

