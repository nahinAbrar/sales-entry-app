# POS Frontend Application

A Point‑of‑Sale (POS) frontend built with Vite + React + TypeScript and Tailwind CSS.  
Implements SKU‑based product search, variant grouping, dynamic payments, hold/retrieve functionality, invoice generation, and integration with a REST API (SKU lookup, employees, accounts, create‐sell).

---

## 🚀 Features

1. **Project Setup**  
   - Vite + React + TypeScript  
   - Tailwind CSS (v3.4.1)  

2. **Environment Variables**  
   - `.env` in project root (ignored by Git):  
     ```shell
     VITE_API_TOKEN=your_bearer_token
     ```  
   - Accessed in code via `import.meta.env.VITE_API_TOKEN`.  
   - Set the same variable in Vercel Dashboard under Project → Settings → Environment Variables.

3. **SKU Search & Variant Grouping**  
   - Search by SKU on **Enter**, fetch product data from:  
     `GET /api/v1/purchase/get-purchase-single?search=<SKU>`  
   - Group variants by **productName** and **size**.  
   - Display each size‑group as one row with:  
     - **Name**, **Size**, **Color**, **Stock**  
     - Side‑by‑side **SKU chips** (click opens confirm modal to remove only that SKU)  
     - **Qty** = number of variants, **Unit Price**, **Subtotal**  
   - Empty‑state message: “Products have not been added yet.”

4. **Salesperson Selection**  
   - Fetch list from `GET /api/v1/employee/get-employee-all`  
   - Dropdown shows `FirstName (Phone)` but stores `id` in state.

5. **Customer Phone**  
   - Input bound to `customerPhone` state, sent in sell payload.

6. **Totals Calculation**  
   - **MRP** = sum of all variant prices  
   - **VAT** applied as percentage: `vatAmount = totalMRP * (vatValue / 100)`  
   - **Discount** either flat or percent of MRP:  
     ```ts
     discountAmount = discountType === 'Percent'
       ? (totalMRP * discountValue) / 100
       : discountValue;
     ```
   - **Payable** = `totalMRP + vatAmount - discountAmount`  
   - **Total Items** = number of product groups  
   - **Total Quantity** = total variants across all groups  

7. **Dynamic Payment Rows**  
   - Fetch account methods from:  
     `GET /api/v1/account/get-accounts?type=All`  
   - Add (`＋`) and remove (trash icon) rows dynamically  
   - Dropdown of account names → stores `accountId`  
   - Live sum of **Total Received** and **Change** = `received - payable`

8. **Hold & Retrieve**  
   - **Hold** 👉 saves current sale (invoice, salesman, products, payments, totals) to in‑memory list, clears form, auto‑increments invoice number.  
   - **Hold List** 👉 modal showing held sales with **Retrieve** and **Delete** actions.  
     - Retrieve loads sale back into form (restores state) and removes it from hold.

9. **Create Sell (Add POS)**  
   - POST to `/api/v1/sell/create-sell` with body:  
     ```json
     {
       "invoiceNo": "...",
       "salesmenId": 4,
       "discountType": "Fixed",
       "discount": 0,
       "phone": "01855271276",
       "totalPrice": 4000,
       "totalPaymentAmount": 5000,
       "changeAmount": 1000,
       "vat": 0,
       "products": [
         { "variationProductId": 31, "quantity": 1, "unitPrice": 400, "discount": 0, "subTotal": 400 },
         …
       ],
       "payments": [
         { "paymentAmount": 2000, "accountId": 7 }, …
       ],
       "sku": ["01004-00015", "01004-00016", …]
     }
     ```  
   - Success/failure shown via inline Tailwind alert.

10. **Cancel / Clear**  
    - Resets all form fields (products, payments, discounts, VAT, invoice, salesman, phone).

---

## 🤝 Acknowledgements
- Built as a Functional Front‑End Task for Tech Element IT Ltd., showcasing:

- React + Vite + TypeScript

- Tailwind CSS (v3.4.1)

- REST API integration (SKU, employees, accounts, create‑sell)

- Dynamic UI state management (hold/retrieve, payments, discounts, VAT)
