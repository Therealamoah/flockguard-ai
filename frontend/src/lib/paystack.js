import PaystackPop from '@paystack/inline-js';
import { backendApi } from './backendApi';

// Gets the actual GHS amount from the backend first (it holds the live
// USD->GHS rate; the browser is never trusted to supply the amount), opens
// the Paystack popup with that, then hands the resulting transaction
// reference back to the backend to verify server-side before the plan is
// actually changed -- the frontend never gets to just declare success.
export async function payForPlan({ plan, email, onSuccess, onError, onCancel }) {
  let quote;
  try {
    quote = await backendApi.get(`/api/payments/quote/${plan.id.toLowerCase()}`);
  } catch (err) {
    onError(err.message);
    return;
  }

  const paystack = new PaystackPop();

  paystack.newTransaction({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: quote.amountInKobo,
    currency: 'GHS',
    onSuccess: async (transaction) => {
      try {
        const result = await backendApi.post('/api/payments/verify', {
          reference: transaction.reference,
          planId: plan.id,
        });
        onSuccess(result.plan);
      } catch (err) {
        onError(err.message);
      }
    },
    onCancel,
  });
}
