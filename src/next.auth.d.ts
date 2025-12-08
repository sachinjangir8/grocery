// this is for change is the perticulare package
declare module "next-auth"{
    interface User {
        id:string,
        name:string,
        email:string,
        role:string
    }
}
export {}