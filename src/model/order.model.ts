import mongoose from "mongoose";
import { number } from "motion";
export interface IOrder{
  _id?:mongoose.Types.ObjectId
  user:mongoose.Types.ObjectId
  items: {
    grocery: mongoose.Types.ObjectId;
    name: string;
    price: number;
    unit: string;
    image?: string;
    quantity: number;
  }[],
  isPaid: boolean,
  totalAmount: number;
  paymentMethod:"cod" | "online"
  address:{
    fullName:string,
    mobile:string,
    city:string,
    state:string,
    pincode:string,
    fullAddress:string,
    latitude:number,
    longitude:number
  }
  status:"pending" | "delivered" | "cancelled" | "outForDelivery"
  createdAt:Date,
  updatedAt:Date
}


const orderSchema=new mongoose.Schema<IOrder>({
  user:{type:mongoose.Types.ObjectId,
    ref:"User",
    required:true
  },
  items:[
    {
      grocery:{type:mongoose.Types.ObjectId,
        ref:"Grocery",
        required:true
      },
      name:{type:String,
        required:true
        },
      price:{type:Number,
        required:true
      },
      unit:{type:String,
        required:true
      },
      image:{type:String
      },
      quantity:{type:Number,
        }
    }
  ],
  isPaid:{type:Boolean,
    default:false
  },
  totalAmount:{type:Number,
    required:true
  },
  paymentMethod:{type:String,
    enum:["cod","online"],
    required:true,
    default:"cod"
  },
  address:{
    fullName:{type:String,
        required:true
    },
    mobile:{type:String,
        required:true
    },
    city:{type:String,
    },
    state:{type:String,
        required:true
    },
    pincode:{type:String,
        required:true
    },
    fullAddress:{type:String,
        required:true
    },
    latitude:{type:Number,
    },
    longitude:{type:Number,

    }
  },
  status:{type:String,
    enum:["pending","delivered","cancelled","outForDelivery"],
    default:"pending"
  },
  createdAt:{type:Date,
    default:Date.now
  },
  updatedAt:{type:Date,
    default:Date.now
  }
})
const Order = mongoose.models.Order || mongoose.model("Order",orderSchema)
export default Order
