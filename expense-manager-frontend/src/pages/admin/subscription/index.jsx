import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import SwiperSlideComponent from "../../../components/slider/SwiperSlideComponent";
import { subscriptionPlans } from "../../../data/subscriptionPlans";
import { useMediaQuery } from "react-responsive";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSubscriptionThunk } from "../../../store/actions";
import { authRoleEnum, eventEnum, periodEnum } from "../../../helpers/enum";
import ApplyPromoCodeModal from "../../../components/admin/modals/promoCode/ApplyPromoCodeModal";
import { handleFirebaseEvent } from "../../../firebase/config";

const Subscription = () => {
  const xl = useMediaQuery({ query: "(max-width: 1399px)" });
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.Auth);
  const [isModal, setIsModal] = useState(false);
  const currentPlanType = useMemo(() => user?.subscriptionName, [user]);
  const { subscriptionDetails } = useSelector((store) => store.Stripe);
  console.log({ subscriptionDetails });

  handleFirebaseEvent(eventEnum.PLAN_VIEWED);

  const handleOpenModal = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  useEffect(() => {
    if (user?.subscriptionId) {
      dispatch(getSubscriptionThunk(user?.subscriptionId));
    }
  }, [user, dispatch, user?.subscriptionId]);

  return (
    <>
      <div className="subscription-plans-section pt-4">
        <PageTitle
          title="Upgrade your plan"
          isButton={user?.role == authRoleEnum.ADMIN ? false : true}
          onButtonClick={handleOpenModal}
          buttonContent="Use promo code"
          subTitle="Select a plan that will be the best fit for your business needs."
        />
        <div
          className={`br-20 mt-3 p-20px bg-white border common-border-color`}
        >
          <Swiper
            className={`position-relative`}
            modules={[Autoplay]}
            centeredSlides={xl ? true : false}
            loop={xl ? true : false}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            initialSlide={2}
            spaceBetween={20}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              430: {
                slidesPerView: 1.3,
              },
              620: {
                slidesPerView: 2,
              },
              700: {
                slidesPerView: 2.1,
              },
              900: {
                slidesPerView: 2,
              },
              1100: {
                slidesPerView: 2.5,
              },
              1280: {
                slidesPerView: 3,
              },
              // 992: {
              //   slidesPerView: 3,
              // },
              1550: {
                slidesPerView: 4,
              },
            }}
          >
            {(subscriptionDetails?.id || currentPlanType == periodEnum.LIFETIME
              ? subscriptionPlans.app.slice(1)
              : subscriptionPlans.app
            ).map((ele, index) => {
              const mostPopular = ele.mostPopular;
              return (
                <SwiperSlide
                  key={index}
                  className={`${
                    mostPopular ? "active" : ""
                  } client-section-bg-color overflow-hidden br-16 position-relative border common-border-color br-18 transition-bg`}
                >
                  <SwiperSlideComponent
                    subscriptionDetails={subscriptionDetails}
                    {...ele}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <ApplyPromoCodeModal isOpen={isModal} onHide={handleCloseModal} />
    </>
  );
};

export default Subscription;
