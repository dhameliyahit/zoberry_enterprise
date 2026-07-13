"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import { usePopulatedCart } from "@/hooks/usePopulatedCart";
import { authService } from "@/services/auth.service";
import { orderService } from "@/services/order.service";
import { useUI } from "@/app/context/UIContext";

interface SavedAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  label?: string;
}

export default function Checkout() {
  const router = useRouter();
  const { items: cartItems, totalPrice } = usePopulatedCart();
  const { openAuthModal } = useUI();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Address book states
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [pincodeError, setPincodeError] = useState("");
  const [shippingPincodeError, setShippingPincodeError] = useState("");

  // Field-level errors for visual inline validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form states
  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [saveToProfile, setSaveToProfile] = useState(false);

  // Shipping to different address logic
  const [shipSameAsBilling, setShipSameAsBilling] = useState(true);
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // Shipping cost & payment states
  const [shippingMethod, setShippingMethod] = useState("free"); // free, fedex, dhl
  const [paymentMethod, setPaymentMethod] = useState("directupi"); // directupi (UPI only)
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin-controlled payment configuration
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    directupi: "UPI (Online)",
    upi: "UPI (Online)",
    card: "Card Payment",
    netbanking: "Direct Bank Transfer",
  };

  // Success states
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Calculate shipping cost
  const shippingCost =
    shippingMethod === "fedex" ? 150 : shippingMethod === "dhl" ? 250 : 0;
  const tax = Math.round(totalPrice * 0.05); // 5% TAX
  const grandTotal = totalPrice + shippingCost + tax;

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    orderService
      .getPaymentConfig()
      .then((res) => {
        if (res.success && res.data) {
          setPaymentConfig(res.data);
          if (res.data.defaultMethod) setPaymentMethod(res.data.defaultMethod);
        }
      })
      .catch(() => {});
  }, []);

  const handleFillTestData = (e: React.MouseEvent) => {
    e.preventDefault();
    setBillingAddress({
      fullName: "Rahul Sharma",
      phone: "9876543210",
      street: "123 MG Road, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      country: "India",
    });
    setShipToDifferent(false);
  };

  // Auto-fetch city & state based on Pincode (India)
  useEffect(() => {
    const pin = billingAddress.zip.trim();
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.[0]) {
            const office = data[0].PostOffice[0];
            setBillingAddress((prev) => ({
              ...prev,
              city: office.District || office.Division || prev.city,
              state: office.State || prev.state,
              country: "India",
            }));
            toast.success(`Autofilled city & state: ${office.District}, ${office.State}`);
            setPincodeError("");
          } else {
            setPincodeError("Invalid pincode. Pincode not found in Indian postal database.");
            toast.error("Invalid billing pincode. Please enter a valid Indian pincode.");
          }
        })
        .catch((err) => {
          console.error("Pincode fetch error:", err);
          setPincodeError("Failed to validate pincode with postal service.");
        });
    } else if (pin.length > 0 && pin.length < 6) {
      setPincodeError("Pincode must be 6 digits.");
    } else {
      setPincodeError("");
    }
  }, [billingAddress.zip]);

  useEffect(() => {
    const pin = shippingAddress.zip.trim();
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.[0]) {
            const office = data[0].PostOffice[0];
            setShippingAddress((prev) => ({
              ...prev,
              city: office.District || office.Division || prev.city,
              state: office.State || prev.state,
              country: "India",
            }));
            toast.success(`Autofilled shipping city & state: ${office.District}, ${office.State}`);
            setShippingPincodeError("");
          } else {
            setShippingPincodeError("Invalid shipping pincode. Pincode not found in Indian postal database.");
            toast.error("Invalid shipping pincode. Please enter a valid Indian pincode.");
          }
        })
        .catch((err) => {
          console.error("Pincode fetch error:", err);
          setShippingPincodeError("Failed to validate shipping pincode.");
        });
    } else if (pin.length > 0 && pin.length < 6) {
      setShippingPincodeError("Shipping pincode must be 6 digits.");
    } else {
      setShippingPincodeError("");
    }
  }, [shippingAddress.zip]);

  // Sync shipping address from billing when "same as billing" is checked
  useEffect(() => {
    if (shipSameAsBilling) {
      setShippingAddress({ ...billingAddress });
    }
  }, [shipSameAsBilling, billingAddress]);

  const fetchUserData = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        setSavedAddresses((res.data.addresses as any) || []);
        // Set basic details if available
        setBillingAddress((prev) => ({
          ...prev,
          fullName: res.data.name || "",
          phone: res.data.phone || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
    }
  };



  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr._id || "");
    setBillingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
    });
    toast.success(`Selected address: ${addr.fullName}`);
  };

  const handleDeleteAddress = async (e: React.MouseEvent, addrId: string) => {
    e.stopPropagation();
    try {
      const res = await authService.deleteAddress(addrId);
      if (res.success) {
        setSavedAddresses(res.data || []);
        if (selectedAddressId === addrId) {
          setSelectedAddressId("");
        }
        toast.success("Address deleted from book");
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleBillingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBillingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please sign in to place an order.",
        confirmButtonColor: "#3085d6",
      });
      openAuthModal();
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Cart is Empty",
        text: "Please add items to your cart before checkout.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // --- Field-level validation ---
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    const zipRegex = /^\d{6}$/;
    const errors: Record<string, string> = {};
    const b = billingAddress;

    if (!b.fullName.trim()) errors.fullName = "Full name is required.";
    if (!b.street.trim()) errors.street = "Street address is required.";
    if (!b.city.trim()) errors.city = "City is required.";
    if (!b.zip.trim()) errors.zip = "Pincode is required.";
    else if (!zipRegex.test(b.zip.trim())) errors.zip = "Enter a valid 6-digit Indian pincode.";
    else if (pincodeError) errors.zip = pincodeError;
    if (!b.country.trim()) errors.country = "Country is required.";
    if (!b.phone.trim()) errors.phone = "Phone number is required.";
    else if (!phoneRegex.test(b.phone.trim())) errors.phone = "Enter a valid 10-digit Indian phone number.";

    if (!shipSameAsBilling) {
      const s = shippingAddress;
      if (!s.fullName.trim()) errors.shipFullName = "Full name is required.";
      if (!s.street.trim()) errors.shipStreet = "Street address is required.";
      if (!s.city.trim()) errors.shipCity = "City is required.";
      if (!s.zip.trim()) errors.shipZip = "Pincode is required.";
      else if (!zipRegex.test(s.zip.trim())) errors.shipZip = "Enter a valid 6-digit Indian pincode.";
      else if (shippingPincodeError) errors.shipZip = shippingPincodeError;
      if (!s.country.trim()) errors.shipCountry = "Country is required.";
      if (!s.phone.trim()) errors.shipPhone = "Phone number is required.";
      else if (!phoneRegex.test(s.phone.trim())) errors.shipPhone = "Enter a valid 10-digit Indian phone number.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Please fill all required fields",
        text: "Some required fields are missing or invalid. Please check the highlighted fields and try again.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Save address to profile if checked
      if (saveToProfile) {
        await authService.addAddress(billingAddress);
        // Refresh address list in background
        fetchUserData();
      }

      // 2. Prepare payload
      const finalShippingAddress = shipSameAsBilling ? billingAddress : shippingAddress;
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        title: item.title,
        image: (item.images as any)?.[0]?.url || "",
        price: item.price,
        quantity: item.quantity,
      }));

      const payload = {
        items: orderItems,
        shippingAddress: finalShippingAddress,
        subtotal: totalPrice,
        shippingCost,
        tax,
        total: grandTotal,
        paymentMethod,
        notes,
      };

      // 3. Submit Order
      const res = await orderService.create(payload);
      if (res.success && res.data) {
        setPlacedOrder(res.data);
        router.push(`/pay/${res.data._id}`);
      } else {
        toast.error(res.error || "Failed to place order.");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: err.message || "An error occurred while creating your order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully placed, render a receipt / payment screen
  if (placedOrder) {
    const orderNo =
      placedOrder.orderNumber || `ZOB-${placedOrder._id.slice(-5).toUpperCase()}`;

    return (
      <>
        <Breadcrumb
          title="Order Success"
          pages={["Checkout", "Success"]}
        />
        <section className="py-20 bg-gray-2 flex items-center justify-center min-h-[70vh]">
          <div className="max-w-[700px] w-full bg-white shadow-xl rounded-2xl p-6 sm:p-10 border border-gray-3 text-center">
            <div className="mx-auto w-16 h-16 bg-green-light-6 text-green flex items-center justify-center rounded-full mb-6">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="font-semibold text-3xl text-dark mb-2">
              Thank You for Your Order!
            </h2>
            <p className="text-dark-4 text-base mb-8">
              Your order has been placed successfully. Order Number:{" "}
              <span className="font-bold text-blue">{orderNo}</span>
            </p>

            <div className="border border-gray-3 rounded-xl p-6 text-left mb-8 space-y-4">
              <h3 className="font-medium text-lg text-dark border-b border-gray-3 pb-3">
                Order Summary
              </h3>
              <div className="space-y-2">
                {placedOrder.items?.map((item: any, key: number) => (
                  <div key={key} className="flex justify-between text-dark">
                    <span>
                      {item.title} <span className="text-dark-4">x{item.quantity}</span>
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-3 pt-3 space-y-2 text-sm text-dark-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{placedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span>₹{placedOrder.shippingCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>₹{placedOrder.tax}</span>
                </div>
                <div className="flex justify-between text-dark text-base font-bold pt-2 border-t border-gray-3">
                  <span>Total Paid</span>
                  <span className="text-blue">₹{placedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center font-medium border border-gray-4 hover:border-dark py-3 px-6 rounded-md ease-out duration-200"
              >
                Print Invoice
              </button>
              <Link
                href="/my-account?tab=orders"
                onClick={() => router.push("/my-account")}
                className="flex items-center justify-center font-medium text-white bg-blue hover:bg-blue-dark py-3 px-6 rounded-md ease-out duration-200"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Address book selector */}
          {isAuthenticated && savedAddresses.length > 0 && (
            <div className="mb-8 bg-white shadow-1 rounded-[10px] p-6 border border-blue/10">
              <h3 className="font-semibold text-lg text-dark mb-4">
                Saved Address Book (Click to Autofill)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`relative p-4 rounded-xl border cursor-pointer hover:border-blue transition-all ${
                      selectedAddressId === addr._id
                        ? "border-2 border-blue bg-blue-light-6"
                        : "border-gray-3 bg-gray-1"
                    }`}
                  >
                    <p className="font-medium text-dark">{addr.fullName}</p>
                    <p className="text-xs text-dark-4 mt-1">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                    </p>
                    <p className="text-xs text-dark-4">{addr.country}</p>
                    <p className="text-xs text-dark-4">Phone: {addr.phone}</p>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(e, addr._id)}
                      className="absolute top-2 right-2 text-red hover:scale-110 p-1 rounded-full hover:bg-red-light-6 transition-all"
                      title="Delete saved address"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 7L18.1327 19.1422C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1422L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* Billing Details */}
                <div>
                  <div className="flex items-center justify-between mb-5.5">
                    <h2 className="font-medium text-dark text-xl sm:text-2xl m-0">
                      Billing details
                    </h2>
                    <button
                      onClick={handleFillTestData}
                      className="text-xs bg-blue/10 hover:bg-blue/20 text-blue font-semibold px-3 py-1.5 rounded-md transition-all active:scale-95 cursor-pointer"
                    >
                      ⚡ Quick Fill Test Data
                    </button>
                  </div>

                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                    <div className="mb-5">
                      <label htmlFor="fullName" className="block mb-2.5">
                        Full Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={billingAddress.fullName}
                        onChange={(e) => { handleBillingChange(e); setFieldErrors(prev => ({ ...prev, fullName: "" })); }}
                        placeholder="John Doe"
                        className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.fullName ? "border-red" : "border-gray-3"}`}
                      />
                      {fieldErrors.fullName && <p className="text-red text-xs mt-1">{fieldErrors.fullName}</p>}
                    </div>

                    <div className="mb-5">
                      <label htmlFor="street" className="block mb-2.5">
                        Street Address <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        id="street"
                        value={billingAddress.street}
                        onChange={(e) => { handleBillingChange(e); setFieldErrors(prev => ({ ...prev, street: "" })); }}
                        placeholder="House number and street name"
                        className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.street ? "border-red" : "border-gray-3"}`}
                      />
                      {fieldErrors.street && <p className="text-red text-xs mt-1">{fieldErrors.street}</p>}
                    </div>

                    <div className="flex gap-4 mb-5">
                      <div className="w-1/2">
                        <label htmlFor="city" className="block mb-2.5">
                          Town/ City <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={billingAddress.city}
                          onChange={(e) => { handleBillingChange(e); setFieldErrors(prev => ({ ...prev, city: "" })); }}
                          placeholder="Mumbai"
                          className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.city ? "border-red" : "border-gray-3"}`}
                        />
                        {fieldErrors.city && <p className="text-red text-xs mt-1">{fieldErrors.city}</p>}
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="state" className="block mb-2.5">
                          State / County
                        </label>
                        <input
                          type="text"
                          name="state"
                          id="state"
                          value={billingAddress.state}
                          onChange={handleBillingChange}
                          placeholder="Maharashtra"
                          className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mb-5">
                      <div className="w-1/2">
                        <label htmlFor="zip" className="block mb-2.5">
                          Zip / Postal Code <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="zip"
                          id="zip"
                          value={billingAddress.zip}
                          onChange={(e) => { handleBillingChange(e); setFieldErrors(prev => ({ ...prev, zip: "" })); }}
                          placeholder="400001"
                          className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.zip ? "border-red" : "border-gray-3"}`}
                        />
                        {fieldErrors.zip && <p className="text-red text-xs mt-1">{fieldErrors.zip}</p>}
                        {pincodeError && !fieldErrors.zip && <p className="text-red text-xs mt-1">{pincodeError}</p>}
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="country" className="block mb-2.5">
                          Country <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          id="country"
                          value={billingAddress.country}
                          onChange={(e) => { handleBillingChange(e); setFieldErrors(prev => ({ ...prev, country: "" })); }}
                          placeholder="India"
                          className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.country ? "border-red" : "border-gray-3"}`}
                        />
                        {fieldErrors.country && <p className="text-red text-xs mt-1">{fieldErrors.country}</p>}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="phone" className="block mb-2.5">
                        Phone <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={billingAddress.phone}
                        onChange={(e) => { handleBillingChange(e); setFieldErrors(prev => ({ ...prev, phone: "" })); }}
                        placeholder="+91 9999999999"
                        className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.phone ? "border-red" : "border-gray-3"}`}
                      />
                      {fieldErrors.phone && <p className="text-red text-xs mt-1">{fieldErrors.phone}</p>}
                    </div>

                    {isAuthenticated && (
                      <div className="mt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveToProfile"
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          className="h-4 w-4 text-blue border-gray-3 rounded"
                        />
                        <label htmlFor="saveToProfile" className="text-sm text-dark cursor-pointer">
                          Save this address to profile address book
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address Section */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="py-5 px-5.5 border-b border-gray-3 flex items-center justify-between">
                    <h3 className="font-medium text-lg text-dark">Shipping Address</h3>
                    {/* Same as billing checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={shipSameAsBilling}
                          onChange={(e) => setShipSameAsBilling(e.target.checked)}
                        />
                        <div className="w-5 h-5 rounded border-2 border-gray-3 peer-checked:border-blue peer-checked:bg-blue flex items-center justify-center transition-all">
                          {shipSameAsBilling && (
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-dark">
                        Same as billing address
                      </span>
                    </label>
                  </div>

                  <div className="p-4 sm:p-8.5">
                    {shipSameAsBilling ? (
                      // Show read-only summary when same as billing
                      <div className="bg-blue/5 border border-blue/20 rounded-lg p-4 text-sm text-dark-4 space-y-1">
                        <p className="font-medium text-dark">{billingAddress.fullName || "—"}</p>
                        <p>{billingAddress.street || "—"}</p>
                        <p>{[billingAddress.city, billingAddress.state].filter(Boolean).join(", ")} {billingAddress.zip}</p>
                        <p>{billingAddress.country}</p>
                        <p>📞 {billingAddress.phone || "—"}</p>
                        <p className="text-xs text-blue mt-2">Shipping to the same address as billing. Uncheck above to change.</p>
                      </div>
                    ) : (
                      // Show editable shipping form
                      <>
                        <div className="mb-5">
                          <label htmlFor="shipFullName" className="block mb-2.5">
                            Full Name <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={shippingAddress.fullName}
                            onChange={(e) => { handleShippingChange(e); setFieldErrors(prev => ({ ...prev, shipFullName: "" })); }}
                            placeholder="John Doe"
                            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.shipFullName ? "border-red" : "border-gray-3"}`}
                          />
                          {fieldErrors.shipFullName && <p className="text-red text-xs mt-1">{fieldErrors.shipFullName}</p>}
                        </div>

                        <div className="mb-5">
                          <label htmlFor="shipStreet" className="block mb-2.5">
                            Street Address <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={shippingAddress.street}
                            onChange={(e) => { handleShippingChange(e); setFieldErrors(prev => ({ ...prev, shipStreet: "" })); }}
                            placeholder="House number and street name"
                            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.shipStreet ? "border-red" : "border-gray-3"}`}
                          />
                          {fieldErrors.shipStreet && <p className="text-red text-xs mt-1">{fieldErrors.shipStreet}</p>}
                        </div>

                        <div className="flex gap-4 mb-5">
                          <div className="w-1/2">
                            <label htmlFor="shipCity" className="block mb-2.5">
                              Town/ City <span className="text-red">*</span>
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={shippingAddress.city}
                              onChange={(e) => { handleShippingChange(e); setFieldErrors(prev => ({ ...prev, shipCity: "" })); }}
                              placeholder="Mumbai"
                              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.shipCity ? "border-red" : "border-gray-3"}`}
                            />
                            {fieldErrors.shipCity && <p className="text-red text-xs mt-1">{fieldErrors.shipCity}</p>}
                          </div>
                          <div className="w-1/2">
                            <label htmlFor="shipState" className="block mb-2.5">
                              State / County
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={shippingAddress.state}
                              onChange={handleShippingChange}
                              placeholder="Maharashtra"
                              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 mb-5">
                          <div className="w-1/2">
                            <label htmlFor="shipZip" className="block mb-2.5">
                              Zip / Postal Code <span className="text-red">*</span>
                            </label>
                            <input
                              type="text"
                              name="zip"
                              value={shippingAddress.zip}
                              onChange={(e) => { handleShippingChange(e); setFieldErrors(prev => ({ ...prev, shipZip: "" })); }}
                              placeholder="400001"
                              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.shipZip ? "border-red" : "border-gray-3"}`}
                            />
                            {fieldErrors.shipZip && <p className="text-red text-xs mt-1">{fieldErrors.shipZip}</p>}
                            {shippingPincodeError && !fieldErrors.shipZip && <p className="text-red text-xs mt-1">{shippingPincodeError}</p>}
                          </div>
                          <div className="w-1/2">
                            <label htmlFor="shipCountry" className="block mb-2.5">
                              Country <span className="text-red">*</span>
                            </label>
                            <input
                              type="text"
                              name="country"
                              value={shippingAddress.country}
                              onChange={(e) => { handleShippingChange(e); setFieldErrors(prev => ({ ...prev, shipCountry: "" })); }}
                              placeholder="India"
                              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.shipCountry ? "border-red" : "border-gray-3"}`}
                            />
                            {fieldErrors.shipCountry && <p className="text-red text-xs mt-1">{fieldErrors.shipCountry}</p>}
                          </div>
                        </div>

                        <div className="mb-5">
                          <label htmlFor="shipPhone" className="block mb-2.5">
                            Phone <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={shippingAddress.phone}
                            onChange={(e) => { handleShippingChange(e); setFieldErrors(prev => ({ ...prev, shipPhone: "" })); }}
                            placeholder="+91 9999999999"
                            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${fieldErrors.shipPhone ? "border-red" : "border-gray-3"}`}
                          />
                          {fieldErrors.shipPhone && <p className="text-red text-xs mt-1">{fieldErrors.shipPhone}</p>}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes box */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* Order Summary list */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* title */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-semibold text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* dynamic product list */}
                    {cartItems.map((item, index) => {
                      const itemPrice =
                        item.price;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between py-4 border-b border-gray-3"
                        >
                          <div className="pr-4">
                            <p className="text-dark text-sm">
                              {item.title} x
                              <span className="font-medium pl-1">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-dark text-right font-medium text-sm">
                              ₹{itemPrice * item.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-b border-gray-3 py-4 space-y-2 text-sm text-dark-4">
                      <div className="flex justify-between">
                        <span>Cart Subtotal</span>
                        <span>₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span>₹{shippingCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax (5%)</span>
                        <span>₹{tax}</span>
                      </div>
                    </div>

                    {/* total */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-semibold text-xl text-blue text-right">
                          ₹{grandTotal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Method Selector */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
                  </div>

                  <div className="p-4 sm:p-8.5">
                    <div className="flex flex-col gap-4">
                      <label
                        htmlFor="free"
                        className="flex cursor-pointer select-none items-center gap-3.5"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          id="free"
                          checked={shippingMethod === "free"}
                          onChange={() => setShippingMethod("free")}
                          className="h-4 w-4 text-blue border-gray-3"
                        />
                        <span>Free Shipping (₹0)</span>
                      </label>

                      <label
                        htmlFor="fedex"
                        className="flex cursor-pointer select-none items-center gap-3.5"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          id="fedex"
                          checked={shippingMethod === "fedex"}
                          onChange={() => setShippingMethod("fedex")}
                          className="h-4 w-4 text-blue border-gray-3"
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-dark">FedEx Standard</span>
                          <span className="text-xs text-dark-4">(+₹150.00)</span>
                        </div>
                      </label>

                      <label
                        htmlFor="dhl"
                        className="flex cursor-pointer select-none items-center gap-3.5"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          id="dhl"
                          checked={shippingMethod === "dhl"}
                          onChange={() => setShippingMethod("dhl")}
                          className="h-4 w-4 text-blue border-gray-3"
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-dark">DHL Express</span>
                          <span className="text-xs text-dark-4">(+₹250.00)</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Payment Selector */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                  <h3 className="font-medium text-xl text-dark">Payment Method</h3>
                </div>

                <div className="p-4 sm:p-8.5">
                  <div className="flex flex-col gap-4">
                     {(paymentConfig?.enabledMethods || ["directupi"]).map((m: string) => (
                      <label
                        key={m}
                        htmlFor={`pay-${m}`}
                        className="flex cursor-pointer select-none items-center gap-3.5"
                      >
                        <input
                          type="radio"
                          name="payment"
                          id={`pay-${m}`}
                          checked={paymentMethod === m}
                          onChange={() => setPaymentMethod(m)}
                          className="h-4 w-4 text-blue border-gray-3"
                        />
                        <span>
                          {PAYMENT_METHOD_LABELS[m] || m}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                </div>

                {/* checkout button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center font-medium text-white bg-blue py-3.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-opacity-50 mt-7.5"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
