import { useDispatch } from "react-redux";
import {
  createStripeSessionThunk,
  getSubscriptionThunk,
} from "../../store/actions";
import { periodEnum } from "../../helpers/enum";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";

const Stripe = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.Auth);
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Demo total",
          amount: 1099,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });
    }
  }, [stripe]);

  useEffect(() => {
    if (user.subscriptionId) {
      dispatch(getSubscriptionThunk(user.subscriptionId));
    }
  }, [user, dispatch]);

  console.log("calling", { paymentRequest });

  if (paymentRequest) {
    return <PaymentRequestButtonElement options={{ paymentRequest }} />;
  }

  return <button onClick={handleCheckout}>Subscribe Weekly</button>;
};

export default Stripe;
