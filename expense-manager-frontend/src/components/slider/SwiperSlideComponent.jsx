import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createStripeSessionThunk,
  upgradeSubscriptionThunk,
  verifyTokenThunk,
} from "../../store/actions";
import { useDispatch } from "react-redux";
import { baseUrl, webUrl } from "../../config/config";
import { ADMIN, AUTH } from "../../constants/routes";
import { useSelector } from "react-redux";
import { eventEnum, periodEnum as globalPeriodEnum } from "../../helpers/enum";
import { toastError } from "../../config/toastConfig";
import { setSubscriptionName } from "../../store/auth/slice";
import AutoPaymentAlertModal from "../admin/modals/AutoPaymentAlertModal";
import CancelSubscription from "../admin/modals/CancelSubscription";
import Cancel from "../stripe/Cancel";
import moment from "moment";
import { handleFirebaseEvent } from "../../firebase/config";

const SwiperSlideComponent = ({
  mostPopular,
  planType,
  redirectTo,
  buttonContent,
  timePeriod,
  price,
  accessedPoints,
  priceId,
  periodEnum,
  upgradePlanButtonContent,
  subscriptionDetails,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((store) => store.Auth);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isAutopayModal, setIsAutopayModal] = useState(false);
  const [cancelSubscriptionModal, setCancelSubscriptionModal] = useState(false);
  const location = useLocation();
  const currentPlanType = user?.subscriptionName;
  const subscriptionExpiredAt =
    user?.subscriptionExpiredAt || "2024-11-21T02:18:00.000+00:00";

  const daysLeft = useCallback(() => {
    const trialStart = new Date().getTime();
    const trialEnd = new Date(subscriptionDetails?.trial_end * 1000);
    const timeDifference = trialEnd - trialStart;

    // if (timeDifference <= 0) {
    //   return 0;
    // }

    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (trialEnd !== null) {
      return daysLeft;
    }
  }, [subscriptionDetails?.trial_end]);

  const trialLeft = daysLeft();

  const handleShowMore = () => {
    setIsShowMore(!isShowMore);
  };

  const handleCheckout = async () => {
    // Redirect to Stripe Checkout
    handleFirebaseEvent(eventEnum.PLAN_SELECTED);
    try {
      const response = await dispatch(
        createStripeSessionThunk({
          subscriptionName: periodEnum,
          priceId,
          paymentSuccessUrl: `https://walletsync-app.vercel.app${ADMIN.SUBSCRIPTION.PATH}`,
          // paymentSuccessUrl: `${baseUrl}/subscription-success/${token}`,
          paymentCancelUrl: `https://walletsync-app.vercel.app${ADMIN.DASHBOARD.PATH}`,
        })
      );

      if (
        createStripeSessionThunk.rejected.match(response) &&
        response.payload.status === 403
      ) {
        navigate(AUTH.SIGN_IN);
      }

      if (createStripeSessionThunk.fulfilled.match(response)) {
        handleFirebaseEvent(eventEnum.PAYMENT_INITIATED);
        // window.open(response.payload.data.url, "_blank");
        window.location.href = response.payload.data.url;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickEvent = async () => {
    if (trialLeft > 0) {
      toastError("You have a trial period left. Please wait until it ends.");
    }
    if (priceId) {
      if (periodEnum == globalPeriodEnum.LIFETIME) {
        if (new Date(subscriptionExpiredAt) > new Date()) {
          toastError(
            "You can purchase this plan after your current plane expires"
          );
        } else {
          handleCheckout();
        }
      } else {
        if (isUpgradable) {
          await handleUpgradePlane();
        } else {
          handleCheckout();
        }
      }
    } else {
      navigate(redirectTo);
    }
  };

  const handleCloseAutoPayModal = useCallback(() => {
    setIsAutopayModal(false);
  }, []);

  const handleUpgradePlane = async () => {
    if (periodEnum == globalPeriodEnum.YEARLY && !isAutopayModal) {
      setIsAutopayModal(true);
    } else {
      const response = await dispatch(upgradeSubscriptionThunk(priceId));
      if (upgradeSubscriptionThunk?.fulfilled?.match(response)) {
        setIsAutopayModal(false);
        if (response.payload.data.plan.id == priceId) {
          dispatch(setSubscriptionName(periodEnum));
        }
      }
    }
  };

  const upgradePaths = useMemo(
    () => ({
      [globalPeriodEnum.WEEKLY]: {
        upgradableTo: [globalPeriodEnum.YEARLY, globalPeriodEnum.LIFETIME],
      },
      [globalPeriodEnum.YEARLY]: {
        upgradableTo: [globalPeriodEnum.LIFETIME],
      },
      [globalPeriodEnum.LIFETIME]: {
        upgradableTo: [],
      },
    }),
    []
  );

  const isUpgradable = useMemo(() => {
    return (
      upgradePaths?.[currentPlanType]?.upgradableTo?.includes(periodEnum) ||
      false
    );
  }, [periodEnum, upgradePaths, currentPlanType]);

  useEffect(() => {
    if (priceId && location?.state?.periodEnum) {
      handleCheckout();
      window.history.replaceState({}, "");
    }
  }, [location, priceId]);
  return (
    <>
      <div
        className={`${
          isShowMore ? "" : "fix-height"
        } p-20px position-relative z-2 pt-3 pb-4 overflow-hidden`}
      >
        <div
          className={`d-flex  flex-wrap gap-2 align-items-center justify-content-between`}
        >
          <h2
            className={`fs-24 text-dark-primary fw-medium lh-32px text-capitalize mb-0`}
          >
            {planType}
          </h2>
          {token && (currentPlanType === periodEnum || !periodEnum) ? (
            <div
              className={`fs-14 fw-semibold d-block text-center br-18 py-2 subscription-plan-btn d-flex align-items-center justify-content-center gap-2`}
            >
              <div
                className={`bg-dark-primary w-20px aspect-square rounded-circle`}
              >
                <i className={`text-white ri-check-line fs-12`}></i>
              </div>
              {trialLeft >= 0
                ? trialLeft == 0
                  ? "Trial ends Today"
                  : `${trialLeft} day(s) left in trial`
                : "your current plan"}
            </div>
          ) : null}
          {currentPlanType !== periodEnum && mostPopular && (
            <div
              className={`m-0 bg-color-primary text-white px-12px py-6-5px rounded-5 text-color-primary border most-popular-plan-border text-capitalize fs-13 fw-normal`}
            >
              most popular
            </div>
          )}
        </div>
        <div className={`mt-4 d-flex align-items-end`}>
          <span
            className={`letter-spacing--2px fs-42 fw-semibold lh-54px text-dark-primary`}
          >
            ${price}
          </span>
          {timePeriod && (
            <span
              className={`ms-1 opacity-75 fs-17 fw-normal plans-time-period-text-color lh-base`}
            >
              /{timePeriod}
            </span>
          )}
        </div>
        <div className={`mt-3 pb-20px border-bottom common-border-color`}>
          {token && (currentPlanType === periodEnum || !periodEnum) ? (
            // <Button
            //   onClick={handleOpenCancellationModal}
            //   className={`fs-16  hover fw-semibold d-block text-center subscription-plan-btn w-100 py-15px d-flex align-items-center justify-content-center gap-2`}
            // >
            //   Cancel Subscription
            // </Button>
            <Cancel disabled={!user?.subscriptionId} />
          ) : (
            <Button
              disabled={
                // subscriptionDetails?.metadata?.subscriptionName !== periodEnum
                //   ? false
                //   : false
                trialLeft >= 0 || (currentPlanType ? !isUpgradable : false)
              }
              onClick={handleClickEvent}
              className={`hover fs-16 fw-semibold d-block text-center subscription-plan-btn w-100 py-15px`}
            >
              {isUpgradable ? upgradePlanButtonContent || "" : buttonContent}
            </Button>
          )}
        </div>
        <ul className={`d-flex flex-column gap-3 m-0 p-0 mt-3`}>
          {accessedPoints.map((ele, index) => {
            const title = ele?.title;
            const isAccess = ele?.isAccess == undefined ? true : ele?.isAccess;
            return (
              <li key={index} className={`d-flex align-items-center gap-2`}>
                {isAccess ? (
                  <i className="fs-21 fw-normal text-color-green-2 ri-check-line"></i>
                ) : (
                  <i className="fs-21 fw-normal text-color-invalid ri-close-line"></i>
                )}
                <span className={`text-dark-primary fw-medium fs-16 lh-sm`}>
                  {title}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={`border-top common-border-color`}>
        <Button
          onClick={handleShowMore}
          to={redirectTo}
          className={`subscription-plan-show-more-btn client-section-bg-color py-12px hover-text-color-primary transition border-0 p-0 m-0 text-capitalize text-dark-primary w-100`}
        >
          <div
            className={`d-flex align-items-center justify-content-center gap-1 position-relative z-2`}
          >
            <span className={`fs-16 fw-medium`}>
              {isShowMore ? "show less" : "show more"}
            </span>
            <i
              className={`lh-0 fs-22 ${
                isShowMore ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
              }`}
            ></i>
          </div>
        </Button>
      </div>

      <AutoPaymentAlertModal
        isOpen={isAutopayModal}
        onHide={handleCloseAutoPayModal}
        onSubmit={handleUpgradePlane}
      />
    </>
  );
};

SwiperSlideComponent.propTypes = {
  mostPopular: PropTypes.any,
  planType: PropTypes.any,
  redirectTo: PropTypes.any,
  buttonContent: PropTypes.any,
  timePeriod: PropTypes.any,
  price: PropTypes.any,
  accessedPoints: PropTypes.any,
  priceId: PropTypes.any,
  periodEnum: PropTypes.any,
  subscriptionDetails: PropTypes.any,
};

export default SwiperSlideComponent;
