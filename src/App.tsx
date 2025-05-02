import { useState, useEffect, useMemo } from 'react';
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

type Payment = {
  method: 'Cash' | 'Bkash' | 'Eastern Bank';
  amount: string;
};


function App() {

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!alertMessage) return;
    const timer = setTimeout(() => setAlertMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [alertMessage]);

  const [invoiceNo, setInvoiceNo] = useState('010520250001');
  const [holdList, setHoldList] = useState<any[]>([]);
  const [showHoldModal, setShowHoldModal] = useState(false);

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

  // Payment rows state
  const [payments, setPayments] = useState<Payment[]>([
    { method: 'Cash', amount: '' },
  ]);

  const addPaymentRow = () =>
    setPayments((prev) => [...prev, { method: 'Cash', amount: '' }]);

  const removePaymentRow = (idx: number) =>
    setPayments((prev) => prev.filter((_, i) => i !== idx));

  const updatePayment = (
    idx: number,
    field: keyof Payment,
    value: string
  ) =>
    setPayments((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, [field]: field === 'amount' ? value : value as Payment['method'] } : p
      )
    );


  const nextInvoice = (current: string) => {
    // 010520250001
    const prefix = current.slice(0, 8);
    const seq = Number(current.slice(8)) + 1;
    return prefix + seq.toString().padStart(4, '0');
  };

  const handleAddPOS = () => {
    setAlertMessage('✅ Product sold successfully!');
  };

  const handleHold = () => {
    // Build current sale payload
    const sale = {
      invoiceNo,
      salesman: selectedSalesmanPhone,
      products,
      payments,
      totals: { payableAmount },
    };

    // Add to hold list
    setHoldList((prev) => [...prev, sale]);

    // Clear screen
    setProducts([]);
    setPayments([{ method: 'Cash', amount: '' }]);
    setDiscountValue(0);
    setVatValue(0);
    setSelectedSalesmanPhone('');
    // Increment invoice
    setInvoiceNo(nextInvoice(invoiceNo));
  };

  const handleShowHoldList = () => setShowHoldModal(true);
  const handleCloseHoldList = () => setShowHoldModal(false);

  const handleRetrieve = (idx: number) => {
    const sale = holdList[idx];
    // Load into form
    setInvoiceNo(sale.invoiceNo);
    setSelectedSalesmanPhone(sale.salesman);
    setProducts(sale.products);
    setPayments(sale.payments);
    // Remove from hold list
    setHoldList((prev) => prev.filter((_, i) => i !== idx));
    setShowHoldModal(false);
  };

  const handleDeleteHold = (idx: number) => {
    setHoldList((prev) => prev.filter((_, i) => i !== idx));
  };


  return (
    <>
      <div className="min-h-screen p-6">
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
                  <label className="block text-sm font-medium text-gray-600">
                    Invoice Number
                  </label>
                  <input
                    title='invoiceNo'
                    type="text"
                    className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                    value={invoiceNo}        // <-- bind to state
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
                {payments.map((pmt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    {/* + on first row, delete on subsequent rows */}
                    {idx === 0 ? (
                      <button
                        type="button"
                        onClick={addPaymentRow}
                        className="p-1 border rounded text-green-600 hover:bg-green-50"
                      >
                        ＋
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePaymentRow(idx)}
                        className="p-1 border rounded text-red-600 hover:bg-red-50"
                      >
                        🗑️
                      </button>
                    )}

                    {/* Method dropdown */}
                    <select
                      title='method'
                      value={pmt.method}
                      onChange={(e) => updatePayment(idx, 'method', e.target.value)}
                      className="flex-1 border rounded px-3 py-2"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bkash">Bkash</option>
                      <option value="Eastern Bank">Eastern Bank</option>
                    </select>

                    {/* Amount input */}
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter Amount"
                      value={pmt.amount}
                      onChange={(e) => updatePayment(idx, 'amount', e.target.value)}
                      className="w-32 border rounded px-3 py-2"
                    />
                  </div>
                ))}
              </div>

              {/* Additional info & actions */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payable Amount</span>
                  <span>{payableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Received Amount</span>
                  <span>
                    {payments
                      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                      .toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Change</span>
                  <span>
                    {(payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) -
                      payableAmount
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                <div className='flex flex-row gap-5 flex-wrap basis-full justify-around'>
                  <button className="bg-red-600 text-white px-4 py-2 rounded">Cancel &amp; Clear</button>
                  <button onClick={handleAddPOS} className="bg-green-600 text-white px-4 py-2 rounded">Add POS</button>
                </div>
                <div className='mt-5 flex flex-row gap-5 flex-wrap justify-between text-center'>
                  <button onClick={handleHold} className="bg-gray-800 text-white px-4 py-2 rounded">Hold</button>
                  <button onClick={handleShowHoldList} className="bg-red-700 text-white px-4 py-2 rounded">Hold List</button>
                  <button className="bg-gray-400 text-white px-4 py-2 rounded">SMS</button>
                  <button className="bg-gray-400 text-white px-4 py-2 rounded">Quotation</button>
                  <button className="bg-gray-400 text-white px-4 py-2 rounded">Reattempt</button>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded">Reprint</button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>


      {showHoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-3/4 max-w-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Held Sales</h2>
            <div className="space-y-4 max-h-96 overflow-auto">
              {holdList.length === 0 && (
                <p className="text-sm text-gray-600">No held items.</p>
              )}
              {holdList.map((sale, idx) => (
                <div
                  key={idx}
                  className="border rounded p-3 flex justify-between items-start"
                >
                  <div>
                    <p><strong>Invoice:</strong> {sale.invoiceNo}</p>
                    <p><strong>Salesman:</strong> {sale.salesman}</p>
                    <p>
                      <strong>Products:</strong> {sale.products.length} items
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      type='submit'
                      onClick={() => handleRetrieve(idx)}
                      className="text-blue-600 hover:underline"
                    >
                      Retrieve
                    </button>
                    <button
                      type='submit'
                      onClick={() => handleDeleteHold(idx)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                type='submit'
                onClick={handleCloseHoldList}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default App
