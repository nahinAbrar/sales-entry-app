import { useState } from 'react';

type Payment = {
    method: 'Cash' | 'Bkash' | 'Eastern Bank';
    amount: string;
};

export default function PaymentSection() {
    const [payments, setPayments] = useState<Payment[]>([
        { method: 'Cash', amount: '' },
    ]);

    const addPaymentRow = () => {
        setPayments((prev) => [...prev, { method: 'Cash', amount: '' }]);
    };

    const removePaymentRow = (idx: number) => {
        setPayments((prev) => prev.filter((_, i) => i !== idx));
    };

    const updatePayment = (
        idx: number,
        field: keyof Payment,
        value: string
    ) => {
        setPayments((prev) =>
            prev.map((p, i) =>
                i === idx
                    ? {
                        ...p,
                        [field]:
                            field === 'amount'
                                ? value
                                : (value as Payment['method']),
                    }
                    : p
            )
        );
    };

    return (
        <section className="bg-white rounded shadow p-4">
            <h3 className="text-gray-700 font-semibold mb-4">Payments</h3>
            <div className="space-y-4">
                {payments.map((pmt, idx) => (
                    <div
                        key={idx}
                        className="flex items-center space-x-2"
                    >
                        {/* + on first row, delete on others */}
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
                            title='Select Payment Method'
                            value={pmt.method}
                            onChange={(e) =>
                                updatePayment(idx, 'method', e.target.value)
                            }
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
                            onChange={(e) =>
                                updatePayment(idx, 'amount', e.target.value)
                            }
                            className="w-32 border rounded px-3 py-2"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
