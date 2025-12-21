import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import connectDB from "./lib/db"
import User from "./model/User.model"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
 
// we will get the credentials from frontend  (auth is used to access the session in backend )
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
                await connectDB();
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
      }),
    //   google auth
    Google({
        clientId:process.env.GOOGLE_CLIENT_ID as string,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],
  callbacks:{
    // ye token ke andr user ka data dalega
    async signIn({user, account}){
      if(account?.provider==="google"){
        await connectDB();
        const dbuser=await User.findOne({email:user.email});
        if(!dbuser){
          await User.create({
            name:user.name ,
            email:user.email ,
            password:"", // blank password for google auth users
            image:user.image 
          })
        }
        user.id=dbuser._id.toString();
        user.role=dbuser.role;
      }
      return true;
    },

    jwt({token,user ,trigger,session}){
        if(user){
            token.id=user.id,
            token.name=user.name,
            token.email=user.email,
            // here we can declare only 3 so for other we have to define the type using new file next.auth.d.ts
            token.role=user.role
        }
        if(trigger=="update"){
          token.role=session.role
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
    maxAge:10*24*60*60
  },
  secret:process.env.NEXTAUTH_SECRET
})
// connectdb
// email check
// password match