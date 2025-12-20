import { auth } from "@/auth";
import EditRoleMoblie from "@/components/EditRoleMoblie";
import connectDB from "@/lib/db";
import User from "@/model/User.model";
import { redirect } from "next/navigation";
import React from "react";

async function Home() {
  await connectDB();
  //  use the auth function to get the current session data in server components if u do not want to use useSession hook in client components
  const session = await auth();
  console.log("Session in Home page:", session);
  const user=await User.findById(session?.user?.id);
  if(!user){
    redirect("/login");
    console.log("No user found");
  }
  const incomplete = !user?.mobile || !user?.role || (!user.mobile && user.role);
  if (incomplete) {
    return <EditRoleMoblie />;
  }

  return (
    <div>
      <h1>hello  sachin i am home</h1>
    </div>
  );
}

export default Home;