import { useEffect, useState } from 'react';
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

  // SKU input
  const [skuInput, setSkuInput] = useState('');

  // List of added products
  const [products, setProducts] = useState<Product[]>([]);

  const handleAddBySku = async () => {
    if (!skuInput.trim()) return;

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

  // State to hold fetched salespeople
  const [salesmen, setSalesmen] = useState<{ id: number; name: string }[]>([]);

  // State for the selected salesman
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<number | "">("");

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
          // Assuming each item has { id, name } fields
          setSalesmen(json.data.map((e: any) => ({
            id: e.id,
            name: e.name,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch salesmen', err);
      }
    };

    fetchSalesmen();
  }, []);


  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
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
                  <select title='salesperson' className="mt-1 w-full border rounded px-3 py-2">
                    <option value="">— Select —</option>
                    {/* …options */}
                    <option value="1">Rifat</option>
                    <option value="2">Karim</option>
                  </select>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Select Discount Type</label>
                  <select title='discount' className="mt-1 w-full border rounded px-3 py-2">
                    <option>Fixed</option>
                    <option>Percent</option>
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
                <div>
                  <label className="block text-sm font-medium text-gray-600">Enter Discount Amount</label>
                  <input
                    type="text"
                    placeholder="Enter the discount amount"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>

                {/* VAT Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Enter The VAT Amount</label>
                  <input
                    type="text"
                    placeholder="Enter the VAT amount"
                    className="mt-1 w-full border rounded px-3 py-2"
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
                  <span>4000.00₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>(+) Vat/Tax</span>
                  <span>0.00₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>(−) Discount</span>
                  <span>0.00₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Number Of Items</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Items Quantity</span>
                  <span>6</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Payable Amount</span>
                  <span>4000.00₺</span>
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
