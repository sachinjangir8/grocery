import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Email from "next-auth/providers/email"
import Google from "next-auth/providers/google"
import connectDB from "./lib/db"
import User from "./model/User.model"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
 
// we will get the credentials from frontend
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // user provider sign-in /login complete
    Credentials({
        credentials: {
          email: {
            type: "email",
            label: "Email",
            placeholder: "sachin@gmail.com",
          },
          password: {
            type: "password",
            label: "Password",
            placeholder: "*****",
          },
        },
        async authorize(credentials, request) {
            try {
                await connectDB
                const email=credentials.email
                const password=credentials.password as string
                const user=await User.findOne({email})
                if(!user){
                    throw new Error ("user does not exist")
                }
                const ismatch=await bcrypt.compare(password,user.password)
                if(!ismatch){
                    throw new Error ("password incorrect")
                }
                return {
                    id:user._id.toString(),
                    email:user.email,
                    name:user.name,
                    role:user.role
                }
            } catch (error) {
                console.error("Authorize error:", error);
                return null;
            }
        },
      })
    //   google auth
  ],
  callbacks:{
    // ye token ke andr user ka data dalega
    jwt({token,user}){
        if(user){
            token.id=user.id,
            token.name=user.name,
            token.email=user.email,
            // here we can declare only 3 so for other we have to define the type using new file next.auth.d.ts
            token.role=user.role
        }
        return token;
    },
    session({session,token}){
        // session ke andr already user field hota hh..
        if(session.user){
            session.user.id=token.id as string,
            session.user.name=token.name as string,
            session.user.email=token.email as string,
            session.user.role=token.role as string
        }
        return session;
    }
  },
  pages:{
    signIn:"/login",
    error:"/login"
  },
  session:{
    strategy:"jwt",
    maxAge:10*24*60*60*1000
  },
  secret:process.env.JWT_SECRET
})
// connectdb
// email check
// password match