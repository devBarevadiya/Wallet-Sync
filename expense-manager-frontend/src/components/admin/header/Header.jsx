import {
  debouncedToastError,
  handleCloseBackdrop,
  handleShowBackdrop,
  isNotPremium,
  isPremium,
  isShowPromoCode,
  logout,
} from "../../../helpers/commonFunctions";
import PropTypes from "prop-types";
import SearchField from "../../inputFields/SearchField";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsSettingsSidbarCanvas,
  setIsSidebarCanvas,
} from "../../../store/filters/slice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, FormControl, Modal } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { useClickOUtside } from "../../../helpers/customHooks";
import { ADMIN, CLIENT, OTHER_AUTH } from "../../../constants/routes";
import { useNavigate } from "react-router-dom";
import { setSearchValueState } from "../../../store/transaction/slice";
import { debounce } from "lodash";
import ProfileModal from "../modals/ProfileModal";
import { Image } from "../../../data/images";
import { authRoleEnum, subscriptionTypeEnum } from "../../../helpers/enum";
import ApplyPromoCodeModal from "../modals/promoCode/ApplyPromoCodeModal";
import GeneratePromoCodeModal from "../modals/promoCode/GeneratePromoCodeModal";

const Header = ({ email, role }) => {
  const navigate = useNavigate();
  const notificationData = [1, 1, 1];
  const { isSidebarCanvas } = useSelector((store) => store.Filters);
  const { user, loading } = useSelector((store) => store.Auth);
  const { searchValue: searchState } = useSelector(
    (store) => store.Transaction
  );
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [showPromoModal, setPromoModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const firstLetter = role?.slice(0, 1);
  const otherLetter = role?.slice(1, role?.length);
  const dispatch = useDispatch();
  const handleSideCanvas = () => dispatch(setIsSidebarCanvas(!isSidebarCanvas));
  const sm = useMediaQuery({ query: "(max-width: 500px)" });
  const md = useMediaQuery({ query: "(max-width: 991px)" });

  useClickOUtside([".search-field", ".ri-search-line"], () => {
    setIsSearch(false);
  });

  useClickOUtside([".notification"], () => {
    setShowNotification(false);
  });

  const handleCloseProfilePopup = (e) => {
    const isInsideDropDown = e.target.closest(".admin-nav-profile-btn");
    const isInsideButton = e.target.closest(".user-popup-button");
    if (!isInsideDropDown && !isInsideButton) {
      setShowUserDetails(false);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setIsSearch(false);
    dispatch(setSearchValueState(""));
  };

  const handleSearch = useCallback(
    debounce((value) => {
      dispatch(setSearchValueState(value));
      // setIsSearch(false);
      value && navigate(ADMIN.RECORDS.PATH);
    }, 500),
    []
  );

  const handleShowNotification = () => {
    if (showNotification) {
      setShowNotification(false);
      handleCloseBackdrop();
    } else {
      setShowNotification(true);
      handleShowBackdrop();
    }
  };

  const openPromoModal = useCallback(() => {
    setPromoModal(true);
  });

  const closePromoModal = useCallback(() => {
    setPromoModal(false);
  });

  useEffect(() => {
    handleSearch(searchValue);
    // dispatch(setSearchValueState(""));
  }, [searchValue]);

  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  useEffect(() => {
    document.addEventListener("mousedown", handleCloseProfilePopup);
    return () => {
      document.removeEventListener("mousedown", handleCloseProfilePopup);
    };
  }, []);

  useEffect(() => {
    dispatch(setIsSidebarCanvas(false));
  }, [location.pathname]);

  useEffect(() => {
    setSearchValue(searchState);
  }, [searchState]);

  useEffect(() => {
    const fetchPromoCodeStatus = async () => {
      const result = await isShowPromoCode(); // Assuming this returns a boolean
      setShowPromoCode(result || false);
    };
    fetchPromoCodeStatus();
  }, []); // Empty dependency array means it runs once on mount

  return (
    <header
      className={`z-50 px-4 position-fixed top-0 end-0 d-flex align-items-center justify-content-between gap-3 h-70px bg-white border-bottom common-border-color`}
    >
      <div className="d-flex align-items-center gap-3 w-100">
        <i
          className="ri-menu-2-line fs-4 d-lg-none cursor-pointer"
          onClick={handleSideCanvas}
        ></i>
        {/* <SearchField groupClass={""} responsive /> */}
        <Form.Group className="w-100 max-w-500">
          {sm && (
            <i
              className="ri-search-line fs-18 text-center cursor-pointer"
              onClick={() => setIsSearch((pre) => !pre)}
            ></i>
          )}
          {isSearch && (
            <div
              className={`${
                sm ? "d-block" : "d-none"
              } search-field d-flex align-items-center text-color-gray common-border-color border admin-header-search-field w-100 position-absolute top-100 bg-white start-0 w-100`}
            >
              <i className="ri-search-line fs-18 text-center "></i>
              <FormControl
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                // onKeyDown={(e) => {
                //   if (e.key == "Enter") {
                //     dispatch(setSearchValueState(e.target.value));
                //     setIsSearch(false);
                //     navigate(ADMIN.RECORDS.PATH);
                //   }
                // }}
                id="header-search"
                placeholder="search transaction here..."
                className="fs-14 text-color-gray p-0 v-fit py-3 pe-5"
              />

              {searchValue && (
                <i
                  onClick={handleClearSearch}
                  className="ri-close-fill fw-medium fs-18 cursor-pointer position-absolute top-50 translate-middle end-0 text-end"
                ></i>
              )}
            </div>
          )}
          <div
            className={`${
              !sm ? "d-block" : "d-none"
            } search-field d-flex align-items-center text-color-gray position-relative common-border-color border admin-header-search-field w-100`}
          >
            <i className="ri-search-line fs-18 text-center"></i>
            <FormControl
              id="header-sm-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  navigate(ADMIN.RECORDS.PATH);
                  dispatch(setSearchValueState(e.target.value));
                }
              }}
              placeholder="search transaction here..."
              className="fs-14 text-color-gray p-0 v-fit py-2 pe-5"
            />

            {searchValue && (
              <i
                onClick={handleClearSearch}
                className="ri-close-fill fw-medium fs-18 cursor-pointer position-absolute top-50 translate-middle end-0 text-end"
              ></i>
            )}
          </div>
        </Form.Group>
      </div>

      <div className="d-flex align-items-center gap-2">
        {((showPromoCode && isNotPremium()) ||
          user?.role == authRoleEnum.ADMIN) && (
          <Button
            onClick={openPromoModal}
            className="p-0 m-0 common-border-color br-10 h-40px w-40px d-flex align-items-center justify-content-center bg-transparent"
          >
            <i className="ri-coupon-3-fill fs-21 text-color-gray"></i>
          </Button>
        )}
        {useMemo(
          () => (
            <Button
              onClick={() =>
                md
                  ? location.pathname?.includes("/settings")
                    ? dispatch(setIsSettingsSidbarCanvas(true))
                    : (navigate(ADMIN.SETTINGS.ACCOUNTS.PATH),
                      dispatch(setIsSettingsSidbarCanvas(true)))
                  : !location.pathname?.includes("/settings") &&
                    navigate(ADMIN.SETTINGS.ACCOUNTS.PATH)
              }
              className={`p-0 m-0 common-border-color br-10 h-40px w-40px d-flex align-items-center justify-content-center bg-transparent`}
            >
              <i className="ri-settings-4-fill fs-21 text-color-gray"></i>
            </Button>
          ),
          [md]
        )}

        {showNotification && <div className="backdrop"></div>}
        <div className="position-relative">
          {/* <Button
            onClick={handleShowNotification}
            className={`p-0 m-0 common-border-color br-10 h-40px w-40px d-flex align-items-center justify-content-center bg-transparent notification`}
          >
            <i className="ri-notification-2-fill fs-18 text-color-gray"></i>
          </Button> */}
          {showNotification && (
            <div className="notification-popup px-4 py-2 rounded-4">
              <ul className="p-0 m-0 d-flex flex-column">
                {notificationData?.map((item, index) => {
                  return (
                    <li
                      key={index}
                      className={`d-flex align-items-center gap-2  ${
                        notificationData?.length !== index + 1
                          ? " border-bottom common-light-border-color"
                          : ""
                      } py-3`}
                    >
                      <img
                        src="https://guardianshot.blr1.digitaloceanspaces.com/expense/Cash/8ab6eb19-122a-44e1-96ff-30c0c57dc976.png"
                        className="w-40px h-40px br-12 object-fit-cover"
                        alt=""
                      />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h6 className="p-0 m-0 fs-14 truncate-line-1 text-break me-3">
                            Payment due today
                          </h6>
                          <span className="fs-12 text-color-light-gray truncate-line-1 me-3 text-break d-block">
                            Don&apos;t forget to pay
                          </span>
                        </div>
                      </div>
                      <span className="d-block bg-color-primary p-1 rounded-circle"></span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {/* <span className="border-start common-border-color h-25px mx-2 my-2 "></span> */}
        {useMemo(
          () => (
            <Button className="position-relative bg-white border-0 p-0 m-0 text-dark text-start admin-nav-profile-btn">
              <div
                className="d-flex align-items-center gap-2 cursor-pointer  "
                onClick={() => setShowUserDetails(!showUserDetails)}
              >
                <img
                  className="h-40px w-40px object-fit-cover rounded-circle"
                  src={
                    user?.avatar
                      ? import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                        user?.avatar
                      : Image.defaultUserImg
                  }
                  alt=""
                />
                <div className="flex-column lh-sm d-none d-md-flex">
                  <span className="fs-14 fw-semibold max-w-150px text-truncate">
                    {email}
                  </span>
                  <span className="fs-12 fw-medium text-color-gray">
                    {firstLetter}
                    <span className="text-lowercase">{otherLetter}</span>
                  </span>
                </div>
              </div>
              <div
                className={`position-absolute end-0 shadow z--1 admin-nav-profile br-5 overflow-hidden bg-white ${
                  showUserDetails
                    ? "visible opacity-100 scale-1 top-100 mt-2"
                    : "invisible opacity-0 scale-0_9 top-50"
                }`}
              >
                <div className={`py-2`}>
                  {/* <span
                onClick={() => navigate(CLIENT.HOME)}
                className="w-100 d-block px-3 py-2 fs-14 hover-primary-bg transition-bg"
              >
                <i className="ri-user-shared-2-line fs-16 me-2"></i> Back To
                Client
              </span> */}
                  {/* <span
                onClick={() => navigate(ADMIN.SETTINGS.ACCOUNTS.PATH)}
                className="w-100 d-block px-3 py-2 fs-14 hover-primary-bg transition-bg"
              >
                <i className="ri-settings-line fs-16 me-2"></i> Setting
              </span> */}
                  <span
                    onClick={() => {
                      setShowProfileModal(true), setShowUserDetails(false);
                    }}
                    className="w-100 d-block px-3 py-2 fs-14 hover-primary-bg transition-bg"
                  >
                    <i className="ri-user-line fs-16 me-2"></i> Profile
                  </span>
                  <span
                    onClick={() => navigate(OTHER_AUTH.CHANGE_PASSWORD)}
                    className="w-100 d-block px-3 py-2 fs-14 hover-primary-bg transition-bg"
                  >
                    <i className="ri-lock-2-line fs-16 me-2"></i> Change
                    Password
                  </span>
                </div>
                <div className={`border-top common-border-color py-2`}>
                  <span
                    onClick={async () => {
                      !loading && (await logout()), setShowUserDetails(false);
                    }}
                    className="w-100 d-block px-3 py-2 fs-14 hover-primary-bg transition-bg"
                  >
                    <i className="ri-logout-circle-r-line fs-16 me-2"></i>{" "}
                    {loading ? "Logging out..." : "Logout"}
                  </span>
                </div>
              </div>
            </Button>
          ),
          [user, email, firstLetter, otherLetter, showUserDetails, loading]
        )}
        {/* profile modal */}
        <ProfileModal
          show={showProfileModal}
          onHide={() => setShowProfileModal(false)}
        />
        <ApplyPromoCodeModal
          isOpen={role !== authRoleEnum.ADMIN && showPromoModal}
          onHide={closePromoModal}
        />
        <GeneratePromoCodeModal
          isOpen={role == authRoleEnum.ADMIN && showPromoModal}
          onHide={closePromoModal}
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  email: PropTypes.string,
  role: PropTypes.string,
};

export default Header;
