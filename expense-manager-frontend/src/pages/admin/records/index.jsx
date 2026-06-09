import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import RecordSidebar from "../../../components/admin/sideBar/RecordSidebar";
import { useCallback, useEffect, useState } from "react";
import {
  deleteMultipleTransactionThunk,
  getTransactionThunk,
} from "../../../store/actions";
import { Button, Form, Placeholder, Table } from "react-bootstrap";
// import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import {
  formatDate,
  formateAmount,
  isTransactionAction,
} from "../../../helpers/commonFunctions";
import {
  endOfYear,
  format,
  isToday,
  isYesterday,
  startOfYear,
  subYears,
} from "date-fns";
import {
  addAccount,
  creditDebitEnum,
  filterEndDate,
  transactionTypeEnum,
} from "../../../helpers/enum";
import { useClickOUtside } from "../../../helpers/customHooks";
import {
  DateRangePicker,
  createStaticRanges,
  defaultStaticRanges,
} from "react-date-range";
import { sortByOptions } from "../../../data/admin/accounts";
import { useMediaQuery } from "react-responsive";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import RecordsLoader from "../accounts/RecordsLoader";
import PaginationDiv from "../../../components/admin/pagination/PaginationDiv";
import AddEditRecord from "../../../components/admin/modals/AddEditRecord";
import { toastError } from "../../../config/toastConfig";
import NoData from "../../../components/admin/NoData";
import DeleteRecordModal from "../../../components/admin/modals/deleteModals/DeleteRecordModal";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import Report from "./Report";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AlertModal from "../../../components/admin/modals/AlertModal";
import {
  setStateEditData,
  setStateIsDuplicate,
} from "../../../store/transaction/slice";
import { IconsImage } from "../../../data/images";

const Records = () => {
  const [canvas, setCanvas] = useState(false);
  const [editData, setEditData] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [isCalender, setIsCalender] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [active, setActive] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dataArray, setDataArray] = useState();
  const {
    data,
    paginationData,
    loading,
    searchValue: searchState,
  } = useSelector((store) => store.Transaction);
  const flatData = data?.flatMap((item) => item?.transaction);
  const { user } = useSelector((store) => store.Auth);
  const { data: accountData } = useSelector((store) => store.Account);

  const filterFlateData = flatData?.filter((item) =>
    isTransactionAction({ id: item?.account?._id })
  );

  const [selectedId, setSelectedId] = useState([]);
  const [state, setState] = useState([
    {
      startDate: startOfYear(new Date()),
      endDate: filterEndDate,
      key: "selection",
    },
  ]);
  const dispatch = useDispatch();
  const xxl = useMediaQuery({ query: "(max-width: 1700px)" });
  // const xl = useMediaQuery({ query: "(max-width: 1400px)" });
  const md = useMediaQuery({ query: "(max-width: 991px)" });
  const sm = useMediaQuery({ query: "(max-width: 621px)" });

  const getTransactionPara = useCallback(async () => {
    await dispatch(
      getTransactionThunk({
        ...getQueryParams(),
        fromDate: formatDate(state[0].startDate, "YYYY-MM-DD"),
        toDate: formatDate(state[0].endDate, "YYYY-MM-DD"),
        page: active,
        ...(searchState && { search: searchState }),
      })
    );
  }, [active, dispatch, searchState, state]);

  const getQueryParams = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const findByKey = (key) => {
      return queryParams.getAll(key);
    };
    const filterData = {};
    for (const [key, value] of queryParams.entries()) {
      if (!filterData?.[key]) {
        filterData[key] = [];
      }
      if (findByKey(key)?.length <= 1) {
        filterData[key].push(value);
        filterData[key].push(value);
      } else {
        filterData[key].push(value);
      }
    }

    return filterData;
  };

  // const triggerDeleteRecord = useConfirmationAlert({
  //   icon: "warning",
  //   title: "Confirm Record Delete",
  //   text: "Are you sure you want to delete this record? This change cannot be undone.",
  //   confirmButtonText: "Delete Record",
  //   cancelButtonText: "Not Now",
  //   confirmButton: "sweet-alert-red-button",
  //   cancelButton: "sweet-alert-green-button",

  //   successText: "Record has been successfully deleted.",
  // });

  const handleShowDateModel = useCallback(() => {
    setIsCalender(true);
    document.body.classList.add("overflow-hidden");
  }, []);

  const handleCloseDateModel = useCallback(() => {
    setIsCalender(false);
    document.body.classList.remove("overflow-hidden");
  }, []);

  useClickOUtside([".rdrDateRangePickerWrapper", ".submit"], () =>
    handleCloseDateModel()
  );

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
  const handleDateSelect = async () => {
    await getTransactionPara();
    setSelectedId([]);
    handleCloseDateModel();
  };

  const countTotalAmount = () => {
    const selectedIdTotal = selectedId?.reduce((acc, curr) => {
      return curr?.type == transactionTypeEnum.INCOME
        ? acc + curr?.amount
        : acc - curr?.amount;
    }, 0);
    const allIdTotal = filterFlateData?.reduce((acc, curr) => {
      return curr?.type == transactionTypeEnum.INCOME
        ? acc + curr?.amount
        : acc - curr?.amount;
    }, 0);
    return selectedIdTotal || allIdTotal;
  };

  const handleSelectRecord = (e, item) => {
    // setSelectedId(id);
    if (e.target.checked) {
      setSelectedId((pre) => [...pre, item]);
    } else {
      setSelectedId((pre) => pre.filter((value) => value?._id !== item?._id));
    }
  };

  const handleSelectSingleRecord = useCallback(
    (item) => setSelectedId(() => [item]),
    []
  );

  const handleSelectAllRecord = (e) => {
    if (e.target.checked) {
      setSelectedId(filterFlateData);
    } else {
      setSelectedId([]);
    }
  };

  const handleAccSelectType = useCallback((type) => {
    setSelectedAccountType(type);
  }, []);

  const sortingFunctions = {
    "A-Z": (a, b) => a.category.title.localeCompare(b.category.title),
    "Z-A": (a, b) => b.category.title.localeCompare(a.category.title),
    "Lowest First": (a, b) => a.amount - b.amount,
    "Highest First": (a, b) => b.amount - a.amount,
    "": () => 0,
  };

  const handleFilter = (sortByValue, searchValue) => {
    setSortBy(sortByValue);
    setSearchValue(searchValue);
    // const searchedDataArray = data.filter((ele) => {
    //   return (
    //     ele.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    //     ele.accountType.title.toLowerCase().includes(searchValue.toLowerCase())
    //   );
    // });

    const sortedSearchedData = flatData.sort(sortingFunctions[sortByValue]);
    setDataArray(sortedSearchedData);
  };

  const handleDeleteRecord = async () => {
    if (selectedId?.length > 0) {
      // triggerDeleteRecord({
      //   dispatchFunction: async () => {
      //     const response = await dispatch(
      //       deleteMultipleTransactionThunk({ ids: selectedId })
      //     );
      //     if (deleteMultipleTransactionThunk.fulfilled.match(response)) {
      //       setSelectedId([]);
      //       await getTransactionPara();
      //       return true;
      //     }
      //   },
      // });
      setIsDelete(true);
    } else {
      toastError("Select at least one record for delete");
    }
  };

  const handleConfirm = useCallback(async () => {
    const allIds = selectedId?.map((item) => item?._id);
    const response = await dispatch(
      deleteMultipleTransactionThunk({ ids: allIds })
    );
    if (deleteMultipleTransactionThunk.fulfilled.match(response)) {
      setSelectedId([]);
      await getTransactionPara();
      return true;
    }
    return false;
  }, [getTransactionPara, selectedId, dispatch]);

  const handleShowModal = useCallback(() => {
    if (accountData?.length > 0) {
      setIsModal(true);
    } else {
      setAlertModal(true);
    }
  }, [accountData?.length]);

  const hideCanvas = useCallback(() => {
    setCanvas(false);
  }, []);

  const showCanvas = useCallback(() => {
    setCanvas(true);
  }, []);

  const handleOpenAccType = useCallback(() => {
    setAccountTypeModel(true);
    setAlertModal(false);
  }, []);

  const handleCloseAccType = useCallback(() => {
    setAccountTypeModel(false);
  }, []);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType("");
  };

  const handleCloseAlert = useCallback(() => {
    setAlertModal(false);
    // setAccountTypeModel(false);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false);
  }, []);

  const openRecordModalDirectly = useCallback(() => {
    setIsModal(true);
  }, []);

  const closeRecordModal = useCallback(() => {
    setEditData({}), setIsModal(false), setIsDuplicate(false);
  }, []);

  useEffect(() => {
    getTransactionPara();
    setSelectedId([]);
  }, [location.search, searchState, active]);

  useEffect(() => {
    setDataArray(flatData);
    handleFilter(sortBy, searchValue);
  }, [data]);

  return (
    <>
      <div className="pt-4">
        <PageTitle
          filterButton={true}
          setCanvas={showCanvas}
          title="Records"
          subTitle="Your financial record, streamlined."
          onSuccess={getTransactionPara}
          isAccountRequired
        />
        <div className="mt-3 d-flex position-relative gap-3 position-relative   max-w-100">
          {/* <div className="mt-3 d-flex position-relative gap-3 position-relative child-layout-sidebar  max-w-100"> */}
          <RecordSidebar isCanvas={canvas} onCanvasHide={hideCanvas} />
          <div className="record-content flex-grow-1 bg-white  border common-border-color rounded-4 invisible-scrollbar">
            <div className="border-bottom common-border-color d-flex align-items-center justify-content-between flex-wrap  p-3 gap-3 responsive">
              <div className="text-nowrap">
                {!loading ? (
                  <span className="client-section-bg-color fs-15 px-4 br-10 py-2">
                    {flatData?.length > 1
                      ? flatData?.length + " Records"
                      : flatData?.length + " Record"}
                  </span>
                ) : (
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-100px`}
                    />
                  </Placeholder>
                )}
              </div>
              <div className="">
                <div className="d-flex gap-2 justify-content-end">
                  {isCalender && <div className="backdrop"></div>}
                  <div
                    className={`${
                      md ? "responsive-calender" : ""
                    } bg-white position-relative text-color-gray order-0 order-sm-1 order-lg-0 br-10 d-flex align-items-center py-2 px-3 common-border-color border cursor-pointer`}
                    onClick={handleShowDateModel}
                  >
                    <i className="ri-calendar-todo-fill me-2 fs-18"></i>
                    <span className="fs-14 responsive truncate-line-1">
                      {" "}
                      {state[0].startDate &&
                        state[0].endDate &&
                        formatDate(state[0].startDate, "YYYY-MM-DD") +
                          " to " +
                          formatDate(state[0].endDate, "YYYY-MM-DD")}{" "}
                    </span>
                    <i className="ri-arrow-down-s-line ms-2 ms-lg-4 fs-21"></i>
                    <div
                      className={`${
                        isCalender
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      } ${
                        xxl
                          ? "position-fixed top-50 start-50 translate-middle"
                          : "position-absolute top-100 end-0"
                      } z-51 mt-2 br-8 overflow-hidden transition-opacity`}
                    >
                      <div className="position-relative record-calender">
                        {isCalender && (
                          <DateRangePicker
                            onChange={(item) => setState([item.selection])}
                            showSelectionPreview={true}
                            moveRangeOnFirstSelection={false}
                            months={md ? 1 : 2}
                            ranges={state}
                            direction="horizontal"
                            staticRanges={customStaticRanges}
                            rangeColors={["#b772ff"]}
                            className={`${md ? "mb-5" : ""}`}
                          />
                        )}
                        <div
                          className={`${
                            sm
                              ? "top-100 end-0 bg-white text-end w-100"
                              : "bottom-0 end-0"
                          } position-absolute py-1 px-2`}
                        >
                          {/* <Button
                          className="me-2 primary-btn fs-14 py-2 v-fit submit"
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
                            className="me-2 mb-2 primary-btn fs-13 py-2 v-fit submit"
                            onClick={handleDateSelect}
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Form.Group>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => {
                        handleFilter(e.target.value, searchValue);
                      }}
                      className={`common-border-color pe-5 py-0 fs-15 text-color-gray responsive text-capitalize br-10`}
                    >
                      {sortByOptions?.map((item, index) => {
                        const title = item.title;
                        const value = item.value;
                        return (
                          <option key={index} value={value}>
                            {title}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
            </div>
            {loading || flatData?.length > 0 ? (
              <>
                <div className="child-layout-sidebar-right-part overflow-scroll invisible-scrollbar bg-white">
                  <Table responsive className="mb-0 w-100  no-border">
                    {/* <thead className="px-3 d-flex py-3 border-bottom common-border-color"> */}
                    {flatData?.length > 0 && (
                      <tbody className="w-100 budget-list">
                        {flatData?.length > 0 && (
                          <tr className="w-100 align-middle">
                            <td className="p-3 border-0 responsive">
                              <span className="d-flex align-items-center gap-2">
                                <Form.Check
                                  className="square-check user-select-none text-color-light-gray fs-16 mb-1 cursor-pointer"
                                  type={"checkbox"}
                                  id={`all-account`}
                                  // label={`Select All`}
                                  checked={
                                    selectedId?.length ==
                                    filterFlateData?.length
                                  }
                                  onChange={handleSelectAllRecord}
                                />
                                <label htmlFor="all-account" className="text-color-light-gray user-select-none cursor-pointer">Select All</label>
                              </span>
                            </td>
                            <td className="text-end d-flex align-items-center justify-content-end gap-2  p-3 border-0">
                              <Report
                                data={dataArray}
                                user={user}
                                balance={countTotalAmount()}
                                filter={{
                                  ...getQueryParams(),
                                  fromDate: formatDate(
                                    state[0].startDate,
                                    "YYYY-MM-DD"
                                  ),
                                  toDate: formatDate(
                                    state[0].endDate,
                                    "YYYY-MM-DD"
                                  ),
                                  pagination: false,
                                  ...(searchState && { search: searchState }),
                                }}
                              />
                              <Button
                                // disabled={selectedId?.length > 0 ? false : true}
                                className={`responsive bg-color-invalid-10 border-color-invalid br-8 h-40px aspect-square d-flex align-items-center justify-content-center hover-bg-invalid-text-white text-color-invalid transition`}
                                onClick={handleDeleteRecord}
                              >
                                <i className="ri-delete-bin-line fs-18 fw-medium lh-0"></i>
                              </Button>
                              <span
                                className={`${
                                  countTotalAmount() >= 0
                                    ? "text-color-light-green"
                                    : "text-color-invalid"
                                } fs-16 fw-medium responsive`}
                              >
                                {/* {countTotalAmount() >= 0 ? "+ " : "- "} */}
                                {formateAmount({ price: countTotalAmount() })}
                              </span>
                            </td>
                          </tr>
                        )}
                        {!loading &&
                          dataArray?.map((item, index1) => {
                            const id = item?._id;

                            const title = item?.category?.title;
                            const toAccountTitle = item?.to?.title;
                            const creditDebit = item?.creditDebit;
                            const accountTitle =
                              creditDebit == creditDebitEnum.DEBIT
                                ? toAccountTitle
                                : item?.account?.title;
                            const accountId = item?.account?._id;
                            const amount = item?.amount;
                            const type = item?.type;
                            const icon =
                              type == transactionTypeEnum.TRANSFER
                                ? creditDebit == creditDebitEnum.CREDIT
                                  ? IconsImage.other.creditTransferIcon
                                  : IconsImage.other.debitTransferIcon
                                : import.meta.env
                                    .VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                                  item?.category?.icon;
                            const currencySymbol = item?.currency?.symbol;
                            const note = item?.note;
                            const payee = item?.payee?.name || "";
                            const labels = item?.labels;
                            const date = new Date(item?.date);
                            const checkPermission = isTransactionAction({
                              id: accountId,
                            });
                            const createdByUser =
                              (item?.user?._id !== user?._id &&
                                item?.user?.username) ||
                              "";
                            const formattedDate = isToday(date)
                              ? "Today"
                              : isYesterday(date)
                              ? "Yesterday"
                              : format(date, "dd MMM yyyy");

                            const formattedTime = format(date, "h:mm a");
                            const toAccount = item?.to?.title || "";

                            return (
                              <tr
                                key={index1}
                                className={`w-100 mt-4 responsive`}
                              >
                                <td
                                  className={`p-3 border-0 cursor-pointer ${
                                    index1 % 2 == 0
                                      ? "client-section-bg-color"
                                      : ""
                                  }`}
                                >
                                  <div className="d-flex gap-3">
                                    <Form.Check
                                      checked={selectedId.some(
                                        (value) => value?._id == item?._id
                                      )}
                                      onChange={(e) =>
                                        handleSelectRecord(e, item)
                                      }
                                      className="square-check text-color-light-gray fs-18 mt-1"
                                      type={"checkbox"}
                                      id={index1}
                                      disabled={!checkPermission}
                                      // label={`select all account`}
                                      // checked={isAccountChecked}
                                      // onChange={handleAccountCheckbox}
                                    />
                                    <div
                                      onClick={() => {
                                        setEditData(item),
                                          dispatch(setStateEditData(item));
                                      }}
                                      className="d-flex gap-3"
                                    >
                                      <img
                                        src={icon}
                                        className="w-40px h-40px br-8"
                                        alt=""
                                      />
                                      <span>
                                        <h6 className="p-0 m-0 fs-16 text-capitalize max-w-300px text-truncate pe-5">
                                          {type == transactionTypeEnum.TRANSFER
                                            ? "Transfer"
                                            : title}
                                        </h6>
                                        <span className="fs-14 text-color-monsoon text-capitalize max-w-300px text-truncate d-block mt-1">
                                          {/* {accountTitle} */}
                                          {type ==
                                          transactionTypeEnum.TRANSFER ? (
                                            <span>
                                              <span
                                                className={`${
                                                  creditDebit ==
                                                  creditDebitEnum.DEBIT
                                                    ? ""
                                                    : "text-color-light-gray"
                                                }`}
                                              >
                                                {item?.account?.title}{" "}
                                              </span>
                                              <i className="ri-arrow-right-long-fill"></i>{" "}
                                              <span
                                                className={`${
                                                  creditDebit ==
                                                  creditDebitEnum.DEBIT
                                                    ? "text-color-light-gray"
                                                    : ""
                                                }`}
                                              >
                                                {toAccount}
                                              </span>
                                            </span>
                                          ) : (
                                            item?.account?.title
                                          )}
                                        </span>
                                        {note && (
                                          <span className="fs-14 text-color-monsoon text-capitalize max-w-300px truncate-line-1 d-block mt-1">
                                            Note: {note}
                                          </span>
                                        )}
                                        {payee && (
                                          <span className="fs-14 text-color-monsoon text-capitalize max-w-300px truncate-line-1 d-block mt-1">
                                            Payer: {payee}
                                          </span>
                                        )}
                                        {labels?.length > 0 && (
                                          <ul className="p-0 m-0 d-flex align-items-center gap-2 mt-2 flex-wrap">
                                            {labels?.map((item, index) => {
                                              return (
                                                <li
                                                  key={index}
                                                  style={{
                                                    backgroundColor:
                                                      item?.color,
                                                  }}
                                                  className="fs-12 text-white px-2 py-1 br-5 max-w-300px d-block truncate-line-1 text-break"
                                                >
                                                  {item?.title}
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td
                                  className={`p-3 border-0 ${
                                    index1 % 2 == 0
                                      ? "client-section-bg-color"
                                      : ""
                                  }`}
                                >
                                  <div className="d-flex justify-content-end">
                                    <span className="d-flex flex-column align-items-end">
                                      <span
                                        className={`${
                                          type == transactionTypeEnum.INCOME ||
                                          creditDebit == creditDebitEnum.CREDIT
                                            ? "text-color-light-green"
                                            : type ==
                                                transactionTypeEnum.EXPENSE ||
                                              creditDebit ==
                                                creditDebitEnum.DEBIT
                                            ? "text-color-invalid"
                                            : ""
                                        } fs-15 fw-medium text-nowrap`}
                                      >
                                        {type == transactionTypeEnum.INCOME ||
                                        creditDebit == creditDebitEnum.CREDIT
                                          ? "+ "
                                          : type ==
                                              transactionTypeEnum.EXPENSE ||
                                            creditDebit == creditDebitEnum.DEBIT
                                          ? "- "
                                          : ""}
                                        {currencySymbol +
                                          formateAmount({ price: amount })}
                                      </span>
                                      <span className="fs-12 text-color-silver-sand text-end mt-1">
                                        {formattedDate} {formattedTime}
                                      </span>
                                      {createdByUser && (
                                        <span className="fs-12 text-color-monsoon text-end text-capitalize max-w-300px text-truncate d-block">
                                          By: {createdByUser}
                                        </span>
                                      )}
                                    </span>
                                    <span className="ms-3">
                                      <ToggleMenu
                                        margin={"m-0"}
                                        rootClass={".budget-list"}
                                        isOpen={openId == id}
                                        onClose={() => setOpenId("")}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openId == id
                                            ? setOpenId("")
                                            : setOpenId(id);
                                        }}
                                      >
                                        <p
                                          onClick={() => {
                                            setIsDuplicate(true),
                                              setEditData(item);
                                            dispatch(setStateEditData(item));
                                            dispatch(setStateIsDuplicate(true));
                                          }}
                                          className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                        >
                                          Duplicate
                                        </p>
                                        <p
                                          onClick={() => {
                                            setEditData(item),
                                              dispatch(setStateEditData(item));
                                          }}
                                          className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                        >
                                          Edit
                                        </p>
                                        <p
                                          onClick={() => {
                                            setIsDelete(true);
                                            handleSelectSingleRecord(item);
                                          }}
                                          className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                        >
                                          Delete
                                        </p>
                                      </ToggleMenu>
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {dataArray?.length < 2 && (
                          <tr>
                            <td className="py-5 border-0"></td>
                          </tr>
                        )}
                      </tbody>
                    )}
                    {loading ? (
                      <tbody>
                        <RecordsLoader />
                      </tbody>
                    ) : !flatData?.length ? (
                      <tbody>
                        <tr>
                          <td className="border-0 responsive">
                            <DynamicLordIcon
                              coverClass="bg-white"
                              icon="abwrkdvl"
                              subTitle="No record found for the provided filter."
                              title="Oops! Record Not Found!"
                            />
                          </td>
                        </tr>
                      </tbody>
                    ) : null}
                  </Table>
                </div>
                {flatData?.length > 0 && !loading ? (
                  <div className={`p-3 responsive`}>
                    <PaginationDiv
                      active={active}
                      limit={limit}
                      totalItems={paginationData?.totalItems}
                      size={paginationData?.totalPages}
                      step={1}
                      icons={true}
                      onClickHandler={(value) => setActive(value)}
                      showingClassName="d-lg-none d-xl-block"
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <NoData
                title="No Records Found"
                description="It looks like there’s nothing here yet. Add your first record to get started!"
                buttonContent="Add Records"
                className=" border-0 height-with-table-header responsive"
                onButtonClick={handleShowModal}
              />
            )}
          </div>
        </div>
        <AddEditRecord
          onSuccess={getTransactionPara}
          isOpen={isModal || Object?.keys(editData)?.length ? true : false}
          onHide={closeRecordModal}
          item={editData}
          isDuplicate={isDuplicate}
          open={openRecordModalDirectly}
        />
      </div>

      <AccountTypeModel
        isOpen={accountTypeModel}
        onSelectValue={handleAccSelectType}
        onHide={handleCloseAccType}
      />

      <AddEditAccountModal
        isOpen={selectedAccountType == addAccount}
        onHide={handleCloseSelectAccount}
        item={{}}
        // onDelete={() => dispatch(analyticsThunk(chartData))}
      />

      <AlertModal
        onClose={handleCloseAlert}
        isOpen={alertModal}
        onConfirm={() => handleOpenAccType()}
      />

      <DeleteRecordModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        data={selectedId}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
};

export default Records;
