import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { orderService } from "@/services/order.service";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load customer orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-dark font-medium">
        Loading your orders...
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* <!-- table header --> */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Status</p>
              </div>

              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Products</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Action</p>
              </div>
            </div>
          )}

          {orders.length > 0 ? (
            orders.map((orderItem, key) => (
              <SingleOrder
                key={key}
                orderItem={orderItem}
                smallView={false}
                onRefresh={fetchOrders}
              />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-dark-4">
              You don&apos;t have any orders yet!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((orderItem, key) => (
            <SingleOrder
              key={key}
              orderItem={orderItem}
              smallView={true}
              onRefresh={fetchOrders}
            />
          ))}
      </div>
    </>
  );
};

export default Orders;
