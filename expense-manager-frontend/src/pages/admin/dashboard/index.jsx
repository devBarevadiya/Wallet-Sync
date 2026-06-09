import PropTypes from "prop-types";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import {
  addAccount,
  analyticsTypeEnum,
  groupAccessEnum,
  subscriptionTypeEnum,
} from "../../../helpers/enum";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import { useDispatch, useSelector } from "react-redux";
import { getAccountThunk } from "../../../store/account/thunk";
import AddEditRecord from "../../../components/admin/modals/AddEditRecord";
import BalanceTrend from "./BalanceTrend";
import ExpenseStructure from "./ExpenseStructure";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import LastRecords from "./LastRecords";
import CashFlow from "./CashFlow";
import { analyticsThunk } from "../../../store/actions";
import TopExpense from "./TopExpense";
import BalanceByCurrency from "./BalanceByCurrency";
import Planned from "./Planned";
import {
  DateRangePicker,
  createStaticRanges,
  defaultStaticRanges,
} from "react-date-range";
import { endOfYear, startOfYear, subYears } from "date-fns";
import { useClickOUtside } from "../../../helpers/customHooks";
import {
  formatDate,
  formateAmount,
  getDateFormateRange,
  handleCloseBackdrop,
  handleShowBackdrop,
  isPremium,
} from "../../../helpers/commonFunctions";
import {
  setFilterAccount,
  setFilterDate,
  setFilterMultipleAccounts,
} from "../../../store/dashboard/slice";
import { useMediaQuery } from "react-responsive";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import Budget from "./Budget";
import AlertModal from "../../../components/admin/modals/AlertModal";
import AddCardModal from "../../../components/admin/modals/AddCardModal";
// import { Purchases } from "@revenuecat/purchases-js";

const Dashboard = ({ user }) => {
  // redux selectors
  const { data, accessLimit } = useSelector((store) => store.Account);
  // const swiperRef = useRef(null);
  const {
    chartData,
    data: dashboardData,
    chartOrder,
  } = useSelector((store) => store.Dashboard);
  const { defaultTimePeriod } = useSelector((store) => store.Dashboard);
  const [isViewAll, setIsViewAll] = useState(false);
  const { singleUserGroupData } = useSelector((store) => store.Group);

  // useEffect(() => {
  //   const fetchOfferings = async () => {
  //     try {
  //       if (user._id) {
  //         const apiKey = "rcb_sb_ydOUPYMSUHhYZjSbReIVfbKfZ";
  //         const useId = user._id;

  //         // Configure Purchases
  //         await Purchases.configure(apiKey, useId);

  //         // await Purchases.getSharedInstance().setEmail(user.email);

  //         // Get customer details
  //         const customer =
  //           await Purchases.getSharedInstance().getCustomerInfo();
  //         console.log({ customer });

  //         // Get offerings details
  //         const offerings = await Purchases.getSharedInstance().getOfferings();
  //         console.log(offerings);
  //         if (
  //           offerings &&
  //           offerings.all &&
  //           offerings.current.availablePackages
  //         ) {
  //           const weeklyPackage = offerings.current.availablePackages[0];

  //           if (weeklyPackage) {
  //             // Proceed with purchase
  //             const purchaseDetails =
  //               await Purchases.getSharedInstance().purchase({
  //                 rcPackage: weeklyPackage,
  //                 attributes: {
  //                   email: user.email,
  //                   buyerName: user.name || "Username",
  //                   billingAddress: {
  //                     country: "IN",
  //                     addressLine1: "Unknown Address",
  //                     city: "Surat",
  //                     postalCode: "395004",
  //                   },
  //                   shippingAddress: {
  //                     country: "IN",
  //                     addressLine1: "Unknown Address",
  //                     city: "Surat",
  //                     postalCode: "395004",
  //                   },
  //                   chargeDescription: "Weekly Subscription",
  //                   description: "Weekly Subscription",
  //                 },
  //               });
  //             console.log({ purchaseDetails });

  //             // Handle post-purchase actions here (e.g., update user data)
  //           } else {
  //             console.error("No available packages for weekly subscription.");
  //           }
  //         } else {
  //           console.error("No offerings available.");
  //         }
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error fetching offerings or processing purchase:",
  //         error
  //       );
  //     }
  //   };

  //   fetchOfferings();
  // }, [user]);

  // state management
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [premiumModel, setPremiumModel] = useState(false);
  const [isCalender, setIsCalender] = useState(false);
  const [isAccountEdit, setIsAccountEdit] = useState({});
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [recordModel, setRecordModel] = useState(false);
  const [isAllowAccSelect, setIsAllowAccSelect] = useState(false);
  const [isAccountChecked, setIsAccountChecked] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [isAddCardModal, setIsAddCardModal] = useState(false);
  const [state, setState] = useState([
    {
      startDate: getDateFormateRange(defaultTimePeriod)?.fromDate,
      endDate: getDateFormateRange(defaultTimePeriod)?.toDate,
      key: "selection",
    },
  ]);
  const enumFromChartData = chartOrder
    ?.filter((item) => item?.isShow && item?.enum)
    ?.map((item) => item.enum);

  const isActiveData = Object?.keys(singleUserGroupData)?.length ? true : false;
  const isAdmin = isActiveData
    ? user?._id == singleUserGroupData?.createBy?._id
    : true;

  const xl = useMediaQuery({ query: "(max-width: 1400px)" });
  const md = useMediaQuery({ query: "(max-width: 991px)" });
  const sm = useMediaQuery({ query: "(max-width: 621px)" });
  const xs = useMediaQuery({ query: "(max-width: 375px)" });
  const prevChartDataRef = useRef(chartData);
  // other functions

  const allAccountId = data?.reduce((acc, val) => [...acc, val._id], []);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType(""), setIsAccountEdit({});
  };
  const dispatch = useDispatch();

  const handleOpenAlert = useCallback(() => {
    setAlertModal(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertModal(false);
    // setAccountTypeModel(false);
  }, []);
  // let chartSequence = [];
  const handleEditAccount = (data) => {
    if (data) {
      setSelectedAccountType("addAccount");
      setIsAccountEdit(data);
    }
  };

  useClickOUtside([".rdrDateRangePickerWrapper", ".submit"], () =>
    handleCloseDateModel()
  );

  const handleShowDateModel = () => {
    setIsCalender(true);
    handleShowBackdrop();
  };

  const handleCloseDateModel = () => {
    setIsCalender(false);
    handleCloseBackdrop();
  };

  const handleOpenCardModal = useCallback(() => setIsAddCardModal(true), []);

  const handleCloseCardModal = useCallback(() => setIsAddCardModal(false), []);

  // const handleAddChartSequence = (id, item) => {
  //   chartSequence.push({ id, item });
  // };

  // chart sequence handling by ladder if else
  const chartComponents = useMemo(() => {
    return enumFromChartData
      ?.map((item, index) => {
        switch (item) {
          case analyticsTypeEnum.BALANCE_TREND:
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color"
              >
                <BalanceTrend
                  data={dashboardData?.[analyticsTypeEnum.BALANCE_TREND]}
                  enumTitle={analyticsTypeEnum.BALANCE_TREND}
                />
              </div>
            );
          case analyticsTypeEnum.SPENDING:
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color"
              >
                <ExpenseStructure
                  data={dashboardData?.[analyticsTypeEnum.SPENDING]}
                  enumTitle={analyticsTypeEnum.SPENDING}
                />
              </div>
            );
          case analyticsTypeEnum.LAST_RECORD:
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color"
              >
                <LastRecords
                  data={dashboardData?.[analyticsTypeEnum.LAST_RECORD]}
                  enumTitle={analyticsTypeEnum.LAST_RECORD}
                  onNoAccount={handleOpenAlert}
                />
              </div>
            );
          case analyticsTypeEnum.CASH_FLOW:
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color cash-flow-chart"
              >
                <CashFlow
                  data={dashboardData?.[analyticsTypeEnum.CASH_FLOW]}
                  enumTitle={analyticsTypeEnum.CASH_FLOW}
                />
              </div>
            );
          case analyticsTypeEnum.COSTLY_EXPENSES:
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color cash-flow-chart"
              >
                <TopExpense
                  data={dashboardData?.[analyticsTypeEnum.COSTLY_EXPENSES]}
                  enumTitle={analyticsTypeEnum.COSTLY_EXPENSES}
                />
              </div>
            );
          case analyticsTypeEnum.CURRENCY:
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color cash-flow-chart"
              >
                <BalanceByCurrency
                  data={dashboardData?.[analyticsTypeEnum.CURRENCY]}
                  enumTitle={analyticsTypeEnum.CURRENCY}
                />
              </div>
            );
          case analyticsTypeEnum.PLANNED:
            // if (dashboardData?.PLANNED?.length > 0) {
            return (
              <div
                key={index}
                className="item bg-white p-4 br-18 border common-border-color"
              >
                <Planned
                  data={dashboardData?.[analyticsTypeEnum.PLANNED]}
                  enumTitle={analyticsTypeEnum.PLANNED}
                />
              </div>
            );
          // }
          // case analyticsTypeEnum.BUDGET:
          //   return (
          //     <div
          //       key={index}
          //       className="item bg-white p-4 br-18 border common-border-color"
          //     >
          //       <Budget
          //         data={dashboardData?.[analyticsTypeEnum.BUDGET]}
          //         enumTitle={analyticsTypeEnum.BUDGET}
          //       />
          //     </div>
          //   );
          // break;
          default:
            return null;
        }
      })
      .filter(Boolean); // Filter out any null values
  }, [enumFromChartData, dashboardData, handleOpenAlert]);

  // add custom range to calendar
  const customStaticRanges = createStaticRanges([
    ...defaultStaticRanges,
    {
      label: "This Year",
      range: () => ({
        startDate: startOfYear(new Date()),
        endDate: new Date(),
      }),
    },
    {
      label: "Last Year",
      range: () => ({
        startDate: startOfYear(subYears(new Date(), 1)),
        endDate: endOfYear(subYears(new Date(), 1)),
      }),
    },
    {
      label: "All Dates",
      range: () => ({
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
      }),
    },
  ]);

  // handle date selection
  const handleDateSelect = () => {
    dispatch(
      setFilterDate({
        fromDate: formatDate(state[0].startDate, "YYYY-MM-DD"),
        toDate: formatDate(state[0].endDate, "YYYY-MM-DD"),
      })
    );
    handleCloseDateModel();
  };

  const handleAccountCheckbox = useCallback(
    (e) => {
      if (e.target.checked) {
        dispatch(setFilterMultipleAccounts(allAccountId));
      } else {
        dispatch(setFilterMultipleAccounts());
      }
      setIsAccountChecked(setIsAccountChecked((pre) => !pre));
    },
    [allAccountId]
  );

  const onSuccess = async (data) => {
    isAccountChecked && dispatch(setFilterAccount(data?.data?._id));
    dispatch(analyticsThunk(chartData));
  };

  const onSuccessRecord = async () => {
    dispatch(analyticsThunk(chartData));
    dispatch(getAccountThunk());
  };

  const handleAllowSelectAcc = useCallback(() => {
    if (isAllowAccSelect) {
      dispatch(setFilterMultipleAccounts());
    }
    setIsAllowAccSelect((pre) => !pre);
    isAllowAccSelect ? setIsViewAll(false) : setIsViewAll(true);
  }, [isAllowAccSelect, dispatch]);

  const accountCards = useMemo(() => {
    return (
      <Row className="mt-2 dashboard-main-card gutter-x-15px">
        {isAdmin || !isActiveData ? (
          <Col sm={6} lg={6} xl={3} xxl={20} className="mb-3">
            <div
              className="bg-white card br-18 border-0  cursor-pointer h-100"
              onClick={() => {
                if (isPremium() || data.length < accessLimit) {
                  setAccountTypeModel(true);
                } else {
                  setPremiumModel(true);
                }
              }}
            >
              <div
                className={`border-2 add-box h-100 justify-content-center ${
                  data?.length > 0 ? "common-border-color" : "account-animation"
                }  border-dashed br-18 py-4 gap-2 d-flex align-items-center`}
              >
                <span className="fs-16 fw-bold responsive text-color-light-gray border-color-light-gray border rounded-circle h-25px w-25px d-flex align-items-center justify-content-center p-0">
                  {/* + */}
                  <i className="ri-add-large-line fs-12"></i>
                </span>
                {/* <i className="ri-add-circle-line text-color-silver fw-light fs-28"></i> */}
                <span className="text-center d-block  fs-18 opacity-50 transition-opacity">
                  Add Account
                </span>
              </div>
            </div>
          </Col>
        ) : null}
        {/* <Col
    xs={isActiveData ? 12 : 7}
    md={isActiveData ? 12 : 8}
    xl={isActiveData ? 12 : 9}
  >
  </Col> */}
        {data?.slice(0, isViewAll ? data?.length : 9)?.map((item, index) => {
          const isSelected =
            (chartData?.accounts && chartData?.accounts?.includes(item?._id)) ||
            false;
          const symbol = item?.currency?.symbol;
          const icon = item?.accountType?.icon;
          // const color = item?.color;
          const title = item?.title;
          // const balance = symbol + "" + item?.balance;
          const balance =
            item?.balance < 0
              ? "- " +
                symbol +
                `${
                  formateAmount({ price: item?.balance })
                    ?.toString()
                    ?.split("-")?.[1]
                }`
              : symbol + "" + formateAmount({ price: item?.balance });
          const accountAccess =
            singleUserGroupData?.member?.accounts[index]?.permission || "";

          return (
            <Col sm={6} lg={6} xl={3} xxl={20} key={index} className="mb-15px">
              <div
                onClick={() => {
                  isAllowAccSelect && dispatch(setFilterAccount(item?._id));
                }}
                className={`card border ${
                  isSelected ? "" : "common-border-color"
                } p-3 br-16 transition-border hover-md-border-color-primary position-relative hover-child-visibility`}
              >
                {(!isActiveData ||
                  groupAccessEnum.ADMIN_ACCESS == accountAccess) && (
                  <i
                    onClick={(e) => {
                      e.stopPropagation(), handleEditAccount(item);
                    }}
                    className={`z-3 ri-pencil-fill ${
                      xs ? "h-30px w-30px" : "h-35px w-35px"
                    } opacity-0  admin-primary-bg d-flex align-items-center justify-content-center br-8 fs-18 cursor-pointer position-absolute top-0 end-0 m-3 m-md-4 hover-bg-light-primary hover-text-color-primary text-color-monsoon`}
                  ></i>
                )}
                <div className="d-flex  gap-2 align-items-center">
                  {isAllowAccSelect && (
                    <Form.Check
                      className={`${
                        data?.length ? "" : "d-none"
                      } square-check text-color-light-gray lg fs-18 cursor-pointer user-select-none transition`}
                      type={"checkbox"}
                      id={`all-account`}
                      checked={isSelected}
                    />
                  )}
                  <div className="d-flex gap-3 cursor-pointer align-items-center">
                    <img
                      src={
                        import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                        icon
                      }
                      className="light-primary-shado w-55px h-55px object-fit-cover br-12"
                      alt=""
                    />
                    <div className="w-100">
                      <h6 className="fs-18 mb-0 mb-sm-1 truncate-line-1 text-break">
                        {balance}
                      </h6>
                      <span className="text-color-monsoon truncate-line-1 text-break text-capitalize d-block fw-normal fs-16">
                        {title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    );
  }, [
    data,
    isActiveData,
    accessLimit,
    isViewAll,
    chartData,
    isAdmin,
    isAllowAccSelect,
    singleUserGroupData,
    user,
    xs,
    dispatch,
  ]);

  const openRecordModalDirect = useCallback(() => {
    setRecordModel(true);
  }, []);

  const closeRecordModalDirect = useCallback(() => {
    setRecordModel(false);
  }, []);

  useEffect(() => {
    if (!data?.length && isAllowAccSelect) {
      setIsAllowAccSelect(false);
    }
  }, [data, isAllowAccSelect]);

  // use effects
  useEffect(() => {
    dispatch(
      setFilterDate({
        fromDate: formatDate(state[0].startDate, "YYYY-MM-DD"),
        toDate: formatDate(state[0].endDate, "YYYY-MM-DD"),
      })
    );
  }, [defaultTimePeriod]);

  useEffect(() => {
    if (prevChartDataRef.current !== chartData) {
      dispatch(analyticsThunk(chartData));
      dispatch(getAccountThunk());
      setIsAccountChecked(
        chartData?.accounts?.length == data?.length ? true : false
      );
      prevChartDataRef.current = chartData;
    }
  }, [chartData]);

  // useEffect(() => {
  //   if (swiperRef.current && swiperRef.current.swiper) {
  //     swiperRef.current.swiper.update();
  //   }
  // }, [isActiveData]);

  return (
    <>
      <div className={`py-4`}>
        {/* ===============================
                upper welcome text
      ===================================*/}
        <div className="d-flex align-items-start justify-content-between flex-row flex-wrap flex-sm-nowrap">
          {useMemo(
            () => (
              <Col xs={12} sm={6} className="pe-3">
                <h2 className="fs-5 fw-light text-truncate mb-1 admin-main-title">
                  Welcome,{" "}
                  <span className="fw-bold">
                    {user?.username ||
                      user?.email?.split(/[_\-.]/)?.[0] ||
                      "user"}
                  </span>
                </h2>
                <p className="text-color-light-gray fs-14 m-0">
                  In this report, you will find your wallet status
                </p>
              </Col>
            ),
            [user]
          )}
          {isCalender && <div className="backdrop"></div>}
          <Col
            xs={12}
            sm={6}
            className={`${
              sm ? "responsive-calender" : ""
            } d-flex flex-sm-wrap gap-2 gap-md-3  position-relative justify-content-sm-end max-w-fit mt-3 mt-sm-0`}
          >
            <div
              className="bg-white order-0 order-sm-1 order-lg-0 br-10 d-flex align-items-center py-2 px-3 common-border-color border cursor-pointer"
              onClick={handleShowDateModel}
            >
              <i className="ri-calendar-todo-fill me-2 fs-18"></i>
              <span className="fs-14 truncate-line-1">
                {" "}
                {state[0].startDate &&
                  state[0].endDate &&
                  formatDate(state[0].startDate, "YYYY-MM-DD") +
                    " to " +
                    formatDate(state[0].endDate, "YYYY-MM-DD")}{" "}
              </span>
              <i className="ri-arrow-down-s-line ms-2 ms-lg-4 fs-18 fw-bold"></i>
            </div>
            <div
              className={`${
                isCalender ? "opacity-100 visible" : "opacity-0 invisible"
              } ${
                xl
                  ? "position-fixed top-50 start-50 translate-middle"
                  : "position-absolute top-100 end-0"
              } z-51 mt-2 br-8 overflow-hidden transition-opacity`}
            >
              <div className="position-relative">
                {useMemo(
                  () => (
                    <DateRangePicker
                      onChange={(item) => setState([item.selection])}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      months={md ? 1 : 2}
                      ranges={state}
                      direction="horizontal"
                      staticRanges={customStaticRanges}
                      rangeColors={["#b772ff"]}
                      className={`${sm ? "mb-5" : ""}`}
                    />
                  ),
                  [state, md, customStaticRanges, sm]
                )}
                <div
                  className={`${
                    sm
                      ? "top-100 end-0 bg-white text-end w-100"
                      : "bottom-0 end-0"
                  } position-absolute py-1 px-2`}
                >
                  {/* <Button
                  className="me-2 mb-2 primary-btn fs-13 py-2 v-fit submit"
                  onClick={() =>
                    setState([
                      {
                        startDate: startOfYear(new Date()),
                        endDate: filterEndDate,
                        key: "selection",
                      },
                    ])
                  }
                >
                  All dates
                </Button> */}
                  <Button
                    className="me-0 mt-1 mb-2 primary-btn fs-13 py-2 v-fit submit"
                    onClick={handleDateSelect}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
            <Button
              className="primary-white-btn order-1 order-sm-0 order-lg-1  v-fit py-1 br-10  hover-bg-color-primary hover-text-color-white hover-text-color-white-i text-dark-primary d-flex align-items-center border border-color-primary px-3 gap-1 "
              onClick={() =>
                !data?.length > 0 ? handleOpenAlert() : setRecordModel(true)
              }
            >
              <i className="ri-add-line fs-22 text-color-primary transition"></i>{" "}
              <span className="text-nowrap fs-15 responsive">Add Record</span>
            </Button>
          </Col>
        </div>
        <span
          className={`${
            data?.length > 0 ? "mt-3" : "mt-4"
          } d-block  d-flex gap-3`}
        >
          {data?.length > 0 && (
            <span className="d-flex align-items-center gap-2">
              <Form.Check
                className={`${
                  data?.length ? "" : "d-none"
                } square-check text-color-light-gray lg mb-2 fs-14 cursor-pointer user-select-none`}
                type={"checkbox"}
                id={`allow-account`}
                // label={`Select Accounts`}
                checked={isAllowAccSelect}
                onChange={handleAllowSelectAcc}
              />
              <label
                htmlFor="allow-account"
                className="fs-15 text-color-light-gray mb-1 cursor-pointer user-select-none"
              >
                Select Accounts
              </label>
            </span>
          )}
          {data?.length > 0 && (
            <span
              className={`d-flex align-items-center gap-2 ${
                isAllowAccSelect ? "" : "opacity-0"
              }`}
            >
              <Form.Check
                disabled={!isAllowAccSelect}
                className={`${
                  data?.length ? "" : "d-none"
                } square-check text-color-light-gray fs-15 mb-2  lg cursor-pointer user-select-none transition `}
                type={"checkbox"}
                id={`all-account`}
                // label={`Select All Account`}
                checked={isAccountChecked}
                onChange={handleAccountCheckbox}
              />
              <label
                htmlFor="all-account"
                className="fs-15 text-color-light-gray mb-1 cursor-pointer user-select-none"
              >
                Select All Account
              </label>
            </span>
          )}
        </span>

        {/* ===============================
                main info section
      ===================================*/}

        <div className="bg-white px-4 br-18 responsive pb-2 pt-3 border common-border-color">
          <span className="d-flex mb-2 w-100 align-items-center justify-content-between">
            <h3 className="fs-21">Account</h3>
            {data?.length > 9 && (
              <span
                className="fs-16 text-color-primary cursor-pointer user-select-none"
                onClick={() => setIsViewAll((pre) => !pre)}
              >
                {isViewAll ? "View Less" : "View All"}
              </span>
            )}
          </span>
          {accountCards}
        </div>

        {/* =======================================
                       models
      ======================================= */}

        {/* <AdminModels
        title={modelTitle}
        onHide={handleClose}
        onSelectValue={(enumTitle) => setAccountTypeModel(enumTitle)}
      />

      <AdminModels title={modelTitle} onHide={handleClose} /> */}

        <AccountTypeModel
          isOpen={accountTypeModel}
          onSelectValue={(enumValue) => setSelectedAccountType(enumValue)}
          onHide={() => setAccountTypeModel(false)}
        />

        <AddEditAccountModal
          isOpen={selectedAccountType == addAccount}
          onHide={handleCloseSelectAccount}
          item={isAccountEdit}
          onSuccess={onSuccess}
          onDelete={() => dispatch(analyticsThunk(chartData))}
        />

        <AddEditRecord
          isOpen={recordModel}
          onHide={closeRecordModalDirect}
          onSuccess={onSuccessRecord}
          onDeleteSuccess={onSuccessRecord}
          open={openRecordModalDirect}
        />

        <PremiumModal
          isShow={premiumModel}
          onHide={() => setPremiumModel(false)}
        />

        <ResponsiveMasonry
          // columnsCountBreakPoints={{ 350: 1, 750: 2, 1200: 3 }}
          columnsCountBreakPoints={{ 350: 1, 800: 2, 991: 1, 1080: 2, 1440: 3 }}
          className="mt-3 pt-1"
        >
          <Masonry gutter="1.2rem" className="responsive">
            {/* {console.log(enumFromChartData, chartOrder)} */}
            {chartComponents}
            {enumFromChartData?.length < chartOrder?.length && (
              <div
                onClick={handleOpenCardModal}
                className="p-3 border border-color-transparent  hover-common-border-color br-18 min-h-300px  cursor-pointer hover-bg-white transition-bg h-100 max-h-300px"
              >
                <div className="border-2 h-100 justify-content-center common-border-color border-dashed br-18 py-4 gap-2 d-flex flex-column align-items-center">
                  <span className="fs-16 fw-bold responsive bg-color-primary p-2 text-white rounded-circle d-flex align-items-center justify-content-center p-0">
                    <i className="ri-add-large-line lh-1 fs-21 p-1"></i>
                  </span>
                  <span className="text-center text-color-gray mt-1 d-block  fs-18 opacity-50 transition-opacity fw-medium">
                    Add Card
                  </span>
                </div>
              </div>
            )}
          </Masonry>
        </ResponsiveMasonry>
      </div>

      <AlertModal
        title={isAdmin ? undefined : "You have no access"}
        description={
          isAdmin
            ? undefined
            : "Account creation is restricted. Please contact to admin"
        }
        cancelBtnContent={isAdmin ? undefined : "Close"}
        confirmBtnContent={isAdmin ? undefined : "Okay"}
        onClose={handleCloseAlert}
        isOpen={alertModal}
        onConfirm={() => {
          isAdmin ? setAccountTypeModel(true) : null;
          handleCloseAlert();
        }}
      />

      <AddCardModal isOpen={isAddCardModal} onClose={handleCloseCardModal} />
    </>
  );
};

Dashboard.propTypes = {
  user: PropTypes.object,
};

export default Dashboard;
