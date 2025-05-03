import { useState, useEffect, useMemo } from 'react';
import './App.css'
import { FaTrash } from 'react-icons/fa';

interface Variant {
  id: number;
  sku: string;
  size: string;
  price: number;
  stock: number;
  color: string | null;
}

interface GroupedProduct {
  productName: string;
  variants: Variant[];
}


type Payment = {
  accountId: number;
  amount: string;
};

type Salesman = {
  id: number;
  firstName: string;
  phone: string;
};

function App() {

  const token = import.meta.env.VITE_API_TOKEN;

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!alertMessage) return;
    const timer = setTimeout(() => setAlertMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [alertMessage]);

  // Which SKU is pending removal?
  const [pendingRemoval, setPendingRemoval] = useState<{
    productName: string;
    sku: string;
    size: string;
  } | null>(null);

  const [invoiceNo, setInvoiceNo] = useState('010520250001');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [holdList, setHoldList] = useState<any[]>([]);
  const [showHoldModal, setShowHoldModal] = useState(false);

  // SKU input
  const [skuInput, setSkuInput] = useState('');

  // List of added products
  const [products, setProducts] = useState<GroupedProduct[]>([]);


  // Barcode product search
  const handleAddBySku = async () => {
    const sku = skuInput.trim();
    if (!sku) return;

    try {
      const res = await fetch(
        `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${sku}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      console.log(json.data)
      if (!json.success || json.data.length === 0) {
        setAlertMessage('SKU not found');
        return;
      }

      const item = json.data[0];
      const variant: Variant = {
        id: item.id,
        sku: item.sku,
        size: item.size,
        price: item.discountPrice,
        stock: item.stock,
        color: item.color,
      };
      const name = item.productName;

      setProducts((prev) => {
        // Find if this product group already exists
        const idx = prev.findIndex((p) => p.productName === name);
        if (idx > -1) {
          // Already grouped: check for duplicate variant
          if (prev[idx].variants.some((v) => v.sku === sku)) {
            setAlertMessage('Product already added');
            return prev;
          }
          // Append to variants
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            variants: [...updated[idx].variants, variant],
          };
          return updated;
        } else {
          // New product group
          return [...prev, { productName: name, variants: [variant] }];
        }
      });

      setSkuInput('');
    } catch (err) {
      console.error(err);
      setAlertMessage('Error fetching SKU');
    }
  };

  const handleRemoveSku = (
    productName: string,
    sku: string,
    size: string
  ) => {
    setProducts((prev) =>
      prev
        .map((group) =>
          group.productName === productName
            ? {
              ...group,
              variants: group.variants.filter(
                (v) => !(v.sku === sku && v.size === size)
              ),
            }
            : group
        )
        .filter((group) => group.variants.length > 0)
    );
  };

  // Remove an entire size‐group (all variants of that size)
  const handleRemoveSizeGroup = (productName: string, size: string) => {
    setProducts((prev) =>
      prev
        .map((group) =>
          group.productName === productName
            ? {
              ...group,
              variants: group.variants.filter((v) => v.size !== size),
            }
            : group
        )
        .filter((group) => group.variants.length > 0)
    );
  };

  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<number | "">("");

  // getting salesman id, firstName, phone
  useEffect(() => {
    fetch(
      'https://front-end-task-lake.vercel.app/api/v1/employee/get-employee-all',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSalesmen(
            json.data.map((e: Salesman) => ({
              id: e.id,
              firstName: e.firstName,
              phone: e.phone,
            }))
          );
        }
      });
  }, [token]);

  const [accounts, setAccounts] = useState<{ id: number; bankName: string }[]>([]);

  useEffect(() => {
    fetch(
      'https://front-end-task-lake.vercel.app/api/v1/account/get-accounts?type=All',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setAccounts(json.data as { id: number; bankName: string }[]);
        }
      });
  }, [token]);


  const [discountType, setDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatValue, setVatValue] = useState<number>(0);

  // Total MRP is the sum of all variant prices
  const totalMRP = useMemo(
    () =>
      products.reduce(
        (sumGroup, group) =>
          sumGroup + group.variants.reduce((sumV, v) => sumV + v.price, 0),
        0
      ),
    [products]
  );

  // Number of distinct product groups
  const totalItems = useMemo(() => products.length, [products]);

  // Total quantity is total number of variants across all groups
  const totalQuantity = useMemo(
    () =>
      products.reduce((sumGroup, group) => sumGroup + group.variants.length, 0),
    [products]
  );

  // VAT amount: percentage of totalMRP
  const vatAmount = useMemo(
    () => (totalMRP * vatValue) / 100,
    [totalMRP, vatValue]
  );

  // Derived discount amount (flat or percent of MRP)
  const discountAmount = useMemo(() => {
    if (discountType === 'Percent') {
      return (totalMRP * discountValue) / 100;
    }
    return discountValue;
  }, [discountType, discountValue, totalMRP]);

  // Final payable: MRP + VAT − flat discount
  const payableAmount = useMemo(
    () => totalMRP + vatAmount - discountAmount,
    [totalMRP, vatAmount, discountAmount]
  );

  // Payment rows state
  const [payments, setPayments] = useState<Payment[]>([
    { accountId: 0, amount: '' },
  ]);


  const addPaymentRow = () =>
    setPayments((prev) => [...prev, { accountId: 0, amount: '' }]);

  const removePaymentRow = (idx: number) =>
    setPayments((prev) => prev.filter((_, i) => i !== idx));

  const updatePayment = (
    idx: number,
    field: keyof Payment,
    value: string
  ) =>
    setPayments((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
            ...p,
            [field]:
              field === 'accountId'
                ? Number(value)
                : value
          } as Payment
          : p
      )
    );

  const nextInvoice = (current: string) => {
    // 010520250001
    const prefix = current.slice(0, 8);
    const seq = Number(current.slice(8)) + 1;
    return prefix + seq.toString().padStart(4, '0');
  };


  const handleHold = () => {
    // Get matched salesman object
    const matchedSalesman = salesmen.find((s) => s.id === selectedSalesmanId);

    const sale = {
      invoiceNo,
      salesman: matchedSalesman?.firstName || '', // ✅ save firstName
      products,
      payments,
      totals: { payableAmount },
    };

    // Add to hold list
    setHoldList((prev) => [...prev, sale]);

    // Clear screen
    setProducts([]);
    setPayments([{ accountId: 0, amount: '' }]);
    setDiscountValue(0);
    setVatValue(0);
    setSelectedSalesmanId('');
    setInvoiceNo(nextInvoice(invoiceNo));
  };

  const handleShowHoldList = () => setShowHoldModal(true);
  const handleCloseHoldList = () => setShowHoldModal(false);

  const handleRetrieve = (idx: number) => {
    const sale = holdList[idx];

    // Lookup ID from firstName
    const matchedSalesman = salesmen.find((s) => s.firstName === sale.salesman);

    setInvoiceNo(sale.invoiceNo);
    setSelectedSalesmanId(matchedSalesman?.id || ''); // ✅ restore ID
    setProducts(sale.products);
    setPayments(sale.payments);

    setHoldList((prev) => prev.filter((_, i) => i !== idx));
    setShowHoldModal(false);
  };

  const handleDeleteHold = (idx: number) => {
    setHoldList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddPOS = async () => {
    // 1. Compute totals
    const totalPrice = totalMRP; // sum of all variant prices
    const totalReceived = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const changeAmount = totalReceived - payableAmount;

    // 2. Flatten products into the API’s expected shape
    const productsForApi = products.flatMap((group) =>
      group.variants.map((v) => ({
        variationProductId: v.id,
        quantity: 1,            // each variant counts as 1
        unitPrice: v.price,
        discount: 0,
        subTotal: v.price,      // quantity × unitPrice
      }))
    );

    // 3. Gather all SKUs
    const skuList = products.flatMap((g) => g.variants.map((v) => v.sku));

    // 4. Build the request body
    const body = {
      invoiceNo,
      salesmenId: selectedSalesmanId,
      discountType,
      discount: discountValue,
      phone: customerPhone,
      totalPrice,
      totalPaymentAmount: totalReceived,
      changeAmount,
      vat: vatValue,
      products: productsForApi,
      payments: payments.map((p) => ({
        paymentAmount: Number(p.amount),
        accountId: p.accountId,
      })),
      sku: skuList,
    };
    console.log('Request body:', body);

    // 5. POST to the API
    try {
      const res = await fetch(
        'https://front-end-task-lake.vercel.app/api/v1/sell/create-sell',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (json.success) {
        setAlertMessage('✅ Product sold successfully!');

      } else {
        setAlertMessage('❌ Sell failed: ' + json.message);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage('❌ Network error on sell');
    }
  };

  const handleClear = () => {
    setProducts([]);
    setPayments([{ accountId: 0, amount: '' }]);
    setDiscountValue(0);
    setVatValue(0);
    setSelectedSalesmanId('');
    setInvoiceNo(nextInvoice(invoiceNo));
    setCustomerPhone('');
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
                    title='sku'
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
                    title='phone'
                    type="text"
                    maxLength={11}
                    placeholder="01855271276"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                {/* Salesperson */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Select Sales Person*</label>
                  <select
                    title='salesmanId'
                    value={selectedSalesmanId}
                    onChange={(e) =>
                      setSelectedSalesmanId(Number(e.target.value))
                    }
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      — Select a salesperson —
                    </option>
                    {salesmen.map((s) => (
                      <option key={s.id} value={s.id}>
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
                    title='membershipId'
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
                    title='discount'
                    type="string"
                    min={0}
                    value={discountValue}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '' || raw === '-') {
                        setDiscountValue(0);
                        return;
                      }
                      const num = Number(raw);
                      if (!isNaN(num) && num >= 0) {
                        setDiscountValue(num);
                      }

                    }}
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
                    title='vat'
                    type="stirng"
                    min={0}
                    value={vatValue}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '' || raw === '-') {
                        setVatValue(0);
                        return;
                      }
                      const num = Number(raw);
                      if (!isNaN(num) && num >= 0) {
                        setVatValue(num);
                      }
                    }}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Enter VAT"
                  />
                </div>
              </div>
            </section>

            {/* 2. Products Information */}
            <section className="bg-white rounded shadow p-4">
              <h3 className="text-gray-700 font-semibold mb-4">Products Information</h3>

              {products.length === 0 ? (
                <p className="text-center text-sm text-gray-500 italic">
                  Products have not been added yet
                </p>
              ) : (
                products.map((group) => {
                  // Build a map: size → variants[]
                  const bySize = group.variants.reduce<Record<string, Variant[]>>(
                    (acc, v) => {
                      (acc[v.size] = acc[v.size] || []).push(v);
                      return acc;
                    },
                    {}
                  );

                  return (
                    <div key={group.productName} className="py-1 mb-2 px-1 rounded-xl bg-blue-100/50">
                      {/* Product heading */}
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {group.productName}
                      </h4>

                      {/* One row per size */}
                      {Object.entries(bySize).map(([size, variants]) => {
                        const qty = variants.length;
                        const unitPrice = variants[0].price;
                        const subtotal = qty * unitPrice;
                        const stock = variants[0].stock;      // assuming same stock per variant
                        const color = variants[0].color ?? 'Not found';

                        return (
                          <div
                            key={size}
                            className="flex items-center justify-between mb-4 border rounded p-4"
                          >
                            {/* Left: Details & SKU chips */}
                            <div className="grid justify-items-start space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Name:</span> {group.productName}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Size:</span> {size}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Color:</span> {color}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Stock:</span> {stock}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-2 items-center">
                                <p className="text-sm">
                                  <span className="font-medium">SKU:</span>
                                </p>
                                {variants.map((v) => (
                                  <span
                                    key={v.id}
                                    className="px-2 py-1 border rounded border-[#243c5a] cursor-pointer hover:bg-red-700 hover:text-white text-sm"
                                    onClick={() =>
                                      setPendingRemoval({
                                        productName: group.productName,
                                        sku: v.sku,
                                        size: size,
                                      })
                                    }
                                  >
                                    {v.sku}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Right: Qty · Unit Price · Subtotal */}
                            <div className="flex items-center space-x-6 text-right">
                              <div>
                                <p className="text-sm text-gray-600">Qty</p>
                                <p className="font-medium">{qty}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Price</p>
                                <p className="font-medium">
                                  Tk. {unitPrice.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="font-medium">
                                  Tk. {subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveSizeGroup(group.productName, size)}
                              className="ml-4 text-gray-500 hover:text-red-500"
                              title="Remove all SKUs of this size"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>

                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
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
                  <input title='notfound' className="mt-1 w-full border rounded px-3 py-2" value="Not found" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Discount</label>
                  <input title='notfound' className="mt-1 w-full border rounded px-3 py-2" value="Not found" readOnly />
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
                  <div key={idx} className="flex items-center space-x-2 text-sm">
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
                      value={pmt.accountId}
                      onChange={(e) =>
                        updatePayment(idx, 'accountId', e.target.value)
                      }
                      className="flex-1 border rounded px-3 py-2"
                    >
                      <option value={0} disabled>
                        — Select Account —
                      </option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.bankName}
                        </option>
                      ))}
                    </select>

                    {/* Amount input */}
                    <input
                      title='amount'
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
                  <button onClick={handleClear} className="bg-red-600 text-white text-sm px-4 py-2 rounded-xl">Cancel &amp; Clear</button>
                  <button onClick={handleAddPOS} className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl">Add POS</button>
                </div>
                <div className='mt-5 flex flex-row gap-5 flex-wrap justify-between text-center'>
                  <button onClick={handleHold} className="bg-gray-800 text-white text-sm px-4 py-2 rounded">Hold</button>
                  <button onClick={handleShowHoldList} className="bg-red-700 text-white text-sm px-4 py-2 rounded">Hold List</button>
                  <button className="bg-gray-400 text-white text-sm px-4 py-2 rounded">SMS</button>
                  <button className="bg-gray-400 text-white text-sm px-4 py-2 rounded">Quotation</button>
                  <button className="bg-gray-400 text-white text-sm px-4 py-2 rounded">Reattempt</button>
                  <button className="bg-gray-800 text-white text-sm px-4 py-2 rounded">Reprint</button>
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
                  <div className='grid justify-items-start'>
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
                      className="text-white hover:scale-90 bg-green-600 p-2 rounded-xl"
                    >
                      Retrieve
                    </button>
                    <button
                      type='submit'
                      onClick={() => handleDeleteHold(idx)}
                      className="text-white hover:scale-90 bg-red-600 p-2 rounded-xl"
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

      {pendingRemoval && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-80">
            <h4 className="text-lg font-semibold mb-4">Confirm Removal</h4>
            <p className="mb-6 text-sm">
              Remove SKU <strong>{pendingRemoval.sku}</strong> (Size: <strong>{pendingRemoval.size}</strong>)?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPendingRemoval(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveSku(
                    pendingRemoval.productName,
                    pendingRemoval.sku,
                    pendingRemoval.size
                  );
                  setPendingRemoval(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  )
}

export default App
