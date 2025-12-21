import { auth } from "@/auth";
import AdminDashBord from "@/components/AdminDashBord";
import DeliveryBoyDashbord from "@/components/DeliveryBoyDashbord";
import EditRoleMoblie from "@/components/EditRoleMoblie";
import Nav from "@/components/Nav";
import UserDashBord from "@/components/UserDashBord";
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
 const planeuser=JSON.parse(JSON.stringify(user));
 console.log("User in Home page:", planeuser);
 console.log("Type of user in Home page:", user);
  return (
    <>
      <Nav user={planeuser} />
      {
  user.role == "user" ? (
    <UserDashBord />
  ) : user.role == "admin" ? (
    <AdminDashBord  />
  ) : user.role == "deliveryBoy" ? (
    <DeliveryBoyDashbord  />
  ) : null
}

    </>
  );
}

export default Home;