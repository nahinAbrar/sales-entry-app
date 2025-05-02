import './App.css'

function App() {


  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left Column: Inputs & Products ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Product & Customer Navigation */}
            <section className="bg-white rounded shadow p-4">
              <h3 className="text-gray-700 font-semibold mb-4">Product &amp; Customer Navigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="Name / Barcode"
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
                  <select className="mt-1 w-full border rounded px-3 py-2">
                    <option value="">— Select —</option>
                    {/* …options */}
                  </select>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Select Discount Type</label>
                  <select className="mt-1 w-full border rounded px-3 py-2">
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
                  <label className="block text-sm font-medium text-gray-600">Enter The Discount Amount</label>
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
                {/* Repeat this block for each product */}
                <div className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm"><strong>Name</strong>: SI-801</p>
                    <p className="text-sm"><strong>Size</strong>: SM</p>
                    <p className="text-sm"><strong>Available Stock</strong>: 10 Units</p>
                    <p className="text-sm"><strong>SKU</strong>: 00015&nbsp;00016</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-28"
                      placeholder="Tk. 350"
                    />
                    <p className="text-sm font-medium">Subtotal<br />700.00₺</p>
                    <button className="ml-4 text-red-600 hover:text-red-800">
                      🗑️
                    </button>
                  </div>
                </div>
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
                  <input className="mt-1 w-full border rounded px-3 py-2" value="N/A" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value="01855271276" readOnly />
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
                  <select className="flex-1 border rounded px-3 py-2">
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
