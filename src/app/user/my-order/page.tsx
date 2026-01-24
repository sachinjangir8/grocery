// components/MyOrders.tsx
"use client";

import Image from "next/image";

const orders = [
  {
    id: "#a06518",
    date: "05/12/2025, 12:21:08",
    payment: "Online Payment",
    address: "Railway Colony, Jhansi, Uttar Pradesh, 284003, India",
    items: [
      {
        name: "Aashirwad Aata 10kg",
        qty: "2 x pack",
        price: 800,
        img: "/atta.png", // add your image in public folder
      },
    ],
    status: "Unpaid",
    delivery: "pending",
    total: 800,
  },
  {
    id: "#a06535",
    date: "05/12/2025, 12:23:41",
    payment: "Online Payment",
    address: "Railway Colony, Jhansi, Uttar Pradesh, 284003, India",
    items: [],
    status: "Unpaid",
    delivery: "pending",
    total: 400,
  },
];

function MyOrder() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">My Orders</h2>

      {orders.map((order, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-sm border p-4 space-y-3"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-green-600 font-semibold">
                order {order.id}
              </h3>
              <p className="text-xs text-gray-500">{order.date}</p>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
                {order.status}
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                pending
              </span>
            </div>
          </div>

          {/* Payment & Address */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>💳 {order.payment}</p>
            <p>📍 {order.address}</p>
          </div>

          {/* Items */}
          {order.items.length > 0 ? (
            <div className="border-t pt-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded">
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.qty}</p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-600 cursor-pointer">
              view 1 Items
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center border-t pt-3">
            <p className="text-sm">
              🚚 Delivery:{" "}
              <span className="text-green-600 font-medium">
                {order.delivery}
              </span>
            </p>
            <p className="font-semibold text-green-600">
              Total: ₹{order.total}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyOrder;
