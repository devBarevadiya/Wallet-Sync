import { useDispatch } from "react-redux";
import {
  cancelSubscriptionThunk,
  getSubscriptionThunk,
} from "../../store/actions";
import { useSelector } from "react-redux";
import CancelSubscription from "../admin/modals/CancelSubscription";
import { useCallback, useState } from "react";
import { Button } from "react-bootstrap";

const Cancel = ({ disabled, buttonContent }) => {
  const dispatch = useDispatch();
  const { subscriptionDetails } = useSelector((store) => store.Stripe);
  const { user } = useSelector((store) => store.Auth);

  const [isModal, setIsModal] = useState(false);

  const handleOpenCancellationModal = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleCloseCancellationModal = useCallback(() => {
    setIsModal(false);
  }, []);

  const handleCancelSubscription = useCallback(async () => {
    // Redirect to Cancel Checkout

    const response = await dispatch(
      cancelSubscriptionThunk({
        cancelAtPeriodEnd: true,
      })
    );

    if (cancelSubscriptionThunk.fulfilled.match(response)) {
      if (user?.subscriptionId) {
        await dispatch(getSubscriptionThunk(user?.subscriptionId));
      }
      handleCloseCancellationModal();
    }
  }, [user]);

  return (
    <>
      {subscriptionDetails.cancel_at_period_end ? (
        <></>
      ) : (
        <Button
          disabled={disabled}
          className={`fs-16  hover fw-semibold d-block text-center subscription-plan-btn w-100 py-15px d-flex align-items-center justify-content-center gap-2`}
          onClick={handleOpenCancellationModal}
        >
          {buttonContent || "Cancel Subscription"}
        </Button>
      )}
      <CancelSubscription
        isOpen={isModal}
        onClose={handleCloseCancellationModal}
        onSubmit={handleCancelSubscription}
      />
    </>
  );
};

export default Cancel;
