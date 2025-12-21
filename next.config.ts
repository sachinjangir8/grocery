import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"lh3.googleusercontent.com",
        port:"",
        pathname:"/**"
      },
      {
        protocol:"https",
        hostname:"www.istockphoto.com",
        port:"",
        pathname:"/**"
      },
      {
        protocol:"https",
        hostname:"t4.ftcdn.net",
        port:"",
        pathname:"/**"
      },
      {
        hostname:"cdn.britannica.com"
      },
      {
        hostname:"media.istockphoto.com"
      }
      
    ]
  }
};

export default nextConfig;
