import React, { useState, useEffect, useMemo } from 'react';
import './App.css'


type Product = {
  variationProductId: number;
  sku: string;
  productName: string;
  size: string;
  stock: number;
  unitPrice: number;
  quantity: number;
  discount: number;
  subTotal: number;
};


function App() {

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!alertMessage) return;
    const timer = setTimeout(() => setAlertMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [alertMessage]);


  // SKU input
  const [skuInput, setSkuInput] = useState('');

  // List of added products
  const [products, setProducts] = useState<Product[]>([]);

  // Barcode product search
  const handleAddBySku = async () => {
    if (!skuInput.trim()) return;

    const sku = skuInput.trim();

    // 1️⃣ Check for duplicate before even calling the API
    if (products.some((p) => p.sku === sku)) {
      setAlertMessage('Product already added');
      return;
    }
    
    try {
      const res = await fetch(
        `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${skuInput}`,
        {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6IkthbXJ1bCIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJhZGRyZXNzIjpudWxsLCJwaG9uZSI6IjAxOTQ1NTE4OTgiLCJyb2xlIjoiTUFOQUdFUiIsImF2YXRhciI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2Ryb3lqaXF3Zi9pbWFnZS91cGxvYWQvdjE2OTY4MDE4MjcvZG93bmxvYWRfZDZzOGJpLmpwZyIsImJyYW5jaCI6MywiYnJhbmNoSW5mbyI6eyJpZCI6MywiYnJhbmNoTmFtZSI6IkhlYWQgT2ZmaWNlIiwiYnJhbmNoTG9jYXRpb24iOiJCYXNodW5kaGFyYSIsImR1ZSI6MCwiYWRkcmVzcyI6IkJhc2h1bmRoYXJhIGNpdHkiLCJwaG9uZSI6IjAxOTQ1NTUxODkyOCIsImhvdGxpbmUiOiIwMTk0NTM2MzU1MiIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJvcGVuSG91cnMiOm51bGwsImNsb3NpbmdIb3VycyI6bnVsbCwiaXNBZGp1c3RtZW50Ijp0cnVlLCJ0eXBlIjoiSGVhZE9mZmljZSJ9LCJpYXQiOjE3NDYwNDE0NzUsImV4cCI6MTc0NzMzNzQ3NX0.PUQfy4Vc2OorR6Yc9JO6lePwiXi20q0MppcIDxGtbsk',
          },
        }
      );
      const json = await res.json();

      if (json.success && json.data.length > 0) {
        const item = json.data[0];
        const newProduct: Product = {
          variationProductId: item.id,
          sku: item.sku,
          productName: item.productName,
          size: item.size,
          stock: item.stock,
          unitPrice: item.sellPrice,
          quantity: 1,
          discount: item.discountPrice - item.sellPrice, // or 0
          subTotal: item.sellPrice,
        };

        // Avoid duplicates: filter out any with same variationProductId
        setProducts((prev) => [
          ...prev.filter((p) => p.variationProductId !== newProduct.variationProductId),
          newProduct,
        ]);

        setSkuInput(''); // clear input
      } else {
        alert('SKU not found');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching SKU');
    }
  };

  // at top of App.tsx
  const [salesmen, setSalesmen] = useState<
    { firstName: string; phone: string }[]
  >([]);
  const [selectedSalesmanPhone, setSelectedSalesmanPhone] = useState<string>("");

  // getting salesman FirstName and Phone
  useEffect(() => {
    const fetchSalesmen = async () => {
      try {
        const res = await fetch(
          'https://front-end-task-lake.vercel.app/api/v1/employee/get-employee-all',
          {
            headers: {
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6IkthbXJ1bCIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJhZGRyZXNzIjpudWxsLCJwaG9uZSI6IjAxOTQ1NTE4OTgiLCJyb2xlIjoiTUFOQUdFUiIsImF2YXRhciI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2Ryb3lqaXF3Zi9pbWFnZS91cGxvYWQvdjE2OTY4MDE4MjcvZG93bmxvYWRfZDZzOGJpLmpwZyIsImJyYW5jaCI6MywiYnJhbmNoSW5mbyI6eyJpZCI6MywiYnJhbmNoTmFtZSI6IkhlYWQgT2ZmaWNlIiwiYnJhbmNoTG9jYXRpb24iOiJCYXNodW5kaGFyYSIsImR1ZSI6MCwiYWRkcmVzcyI6IkJhc2h1bmRoYXJhIGNpdHkiLCJwaG9uZSI6IjAxOTQ1NTUxODkyOCIsImhvdGxpbmUiOiIwMTk0NTM2MzU1MiIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJvcGVuSG91cnMiOm51bGwsImNsb3NpbmdIb3VycyI6bnVsbCwiaXNBZGp1c3RtZW50Ijp0cnVlLCJ0eXBlIjoiSGVhZE9mZmljZSJ9LCJpYXQiOjE3NDYwNDE0NzUsImV4cCI6MTc0NzMzNzQ3NX0.PUQfy4Vc2OorR6Yc9JO6lePwiXi20q0MppcIDxGtbsk',
            },
          }
        );
        const json = await res.json();
        if (json.success) {
          // json.data is an array of { name, phone }
          console.log(json.data);
          setSalesmen(json.data as { firstName: string; phone: string }[]);
        }
      } catch (err) {
        console.error('Failed to fetch salesmen', err);
      }
    };
    fetchSalesmen();
  }, []);


  const [discountType, setDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatValue, setVatValue] = useState<number>(0);

  const totalMRP = useMemo(
    () => products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0),
    [products]
  );

  const totalItems = useMemo(() => products.length, [products]);

  const totalQuantity = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity, 0),
    [products]
  );

  // Calculate final payable:
  const vatAmount = useMemo(
    () => (totalMRP * vatValue) / 100,
    [totalMRP, vatValue]
  );

  // Final payable: MRP + VAT amount − discount (flat)
  const payableAmount = useMemo(
    () => totalMRP + vatAmount - discountValue,
    [totalMRP, vatAmount, discountValue]
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {alertMessage && (
          <div className="mb-4 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {alertMessage}
          </div>
        )}

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left Column: Inputs & Products ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Product & Customer Navigation */}
            <section className="bg-white rounded shadow p-4">
              <h3 className="text-gray-700 font-semibold mb-4">Product &amp; Customer Navigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="010520250001"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value=""
                    readOnly
                  />
                </div>

                {/* Product Barcode */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Product Barcode*</label>
                  <input
                    type="text"
                    value={skuInput}
                    onChange={(e) => setSkuInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBySku();
                      }
                    }}
                    placeholder="Enter SKU or Barcode"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <input
                    type="text"
                    placeholder="01855271276"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Salesperson */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Select Sales Person*</label>
                  <select
                    title='salesperson'
                    value={selectedSalesmanPhone}
                    onChange={(e) => setSelectedSalesmanPhone(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      — Select a salesperson —
                    </option>
                    {salesmen.map((s) => (
                      <option key={s.phone} value={s.phone}>
                        {s.firstName} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Discount Type
                  </label>
                  <select
                    title='discountType'
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'Fixed' | 'Percent')}
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Percent">Percent</option>
                  </select>
                </div>

                {/* Membership ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Membership id</label>
                  <input
                    type="text"
                    placeholder="Membership id"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Discount Amount */}
                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder={discountType === 'Percent' ? '%' : 'Fixed amount'}
                  />
                </div>

                {/* VAT Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    VAT Amount (in %)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={vatValue}
                    onChange={(e) => setVatValue(Number(e.target.value))}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Enter VAT"
                  />
                </div>
              </div>
            </section>

            {/* 2. Products Information */}
            <section className="bg-white rounded shadow p-4">
              <h3 className="text-gray-700 font-semibold mb-4">Products Information</h3>
              <div className="space-y-4">
                {products.map((p) => (
                  <div
                    key={p.variationProductId}
                    className="border rounded p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm"><strong>Name</strong>: {p.productName}</p>
                      <p className="text-sm"><strong>Size</strong>: {p.size}</p>
                      <p className="text-sm"><strong>Available Stock</strong>: {p.stock} Units</p>
                      <p className="text-sm"><strong>SKU</strong>: {p.sku}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        title='quantity'
                        type="number"
                        min={1}
                        max={p.stock}
                        value={p.quantity}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setProducts((prev) =>
                            prev.map((x) =>
                              x.variationProductId === p.variationProductId
                                ? {
                                  ...x,
                                  quantity: qty,
                                  subTotal: qty * x.unitPrice - x.discount
                                }
                                : x
                            )
                          );
                        }}
                        className="border rounded px-3 py-2 w-20"
                      />
                      <p className="text-sm font-medium">
                        {p.subTotal.toFixed(2)}₺
                      </p>
                      <button
                        onClick={() =>
                          setProducts((prev) =>
                            prev.filter((x) => x.variationProductId !== p.variationProductId)
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ─── Right Column: Customer Info & Payments ──────────────────── */}
          <div className="space-y-6">

            {/* 3. Customer's Information */}
            <section className="bg-white rounded shadow p-4">
              <h3 className="text-gray-700 font-semibold mb-4">Customer's Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <input title='Name' className="mt-1 w-full border rounded px-3 py-2" value="N/A" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <input title='Phone' className="mt-1 w-full border rounded px-3 py-2" value="01855271276" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Membership</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value="Not found" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Discount</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value="Not found" readOnly />
                </div>
              </div>
            </section>

            {/* 4. Totals & Payment */}
            <section className="bg-white rounded shadow p-4">
              <h3 className="text-gray-700 font-semibold mb-4">Totals &amp; Payment</h3>

              {/* Totals summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Maximum Retail Price (MRP)</span>
                  <span>{totalMRP.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>(+) Vat/Tax %</span>
                  <span>{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>(−) Discount</span>
                  <span>
                    {discountType === 'Percent'
                      ? `${discountValue}%`
                      : discountValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Number Of Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Items Quantity</span>
                  <span>{totalQuantity}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Payable Amount</span>
                  <span>{payableAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payments */}
              <div className="space-y-4">
                {/* Repeat for each payment row */}
                <div className="flex items-center space-x-2">
                  <button className="p-1 border rounded">＋</button>
                  <select title='salesperson' className="flex-1 border rounded px-3 py-2">
                    <option>Choose The Method...</option>
                  </select>
                  <input
                    type="text"
                    className="w-32 border rounded px-3 py-2"
                    placeholder="Enter Payment Amount"
                  />
                </div>
              </div>

              {/* Additional info & actions */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payable Amount</span>
                  <span>4000.00₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Received Amount</span>
                  <span>5000.00₺</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Change</span>
                  <span>1000.00₺</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button className="bg-red-600 text-white px-4 py-2 rounded">Cancel &amp; Clear</button>
                <button className="bg-green-600 text-white px-4 py-2 rounded">Add POS</button>
                <button className="bg-gray-800 text-white px-4 py-2 rounded">Hold</button>
                <button className="bg-red-700 text-white px-4 py-2 rounded">Hold List</button>
                <button className="bg-gray-400 text-white px-4 py-2 rounded">SMS</button>
                <button className="bg-gray-400 text-white px-4 py-2 rounded">Quotation</button>
                <button className="bg-gray-400 text-white px-4 py-2 rounded">Reattempt</button>
                <button className="bg-gray-800 text-white px-4 py-2 rounded">Reprint</button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  )
}

export default App
