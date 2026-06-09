import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAccountThunk,
  deleteMultipleTransactionThunk,
  getAccountDetailsThunk,
  getTransactionThunk,
} from "../../../store/actions";
import { Button, Form, Placeholder, Table } from "react-bootstrap";
import { subPagesNavItems } from "../../../data/admin/accounts";
import { ADMIN } from "../../../constants/routes";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import PaginationDiv from "../../../components/admin/pagination/PaginationDiv";
import RecordsLoader from "./RecordsLoader";
import { toastError } from "../../../config/toastConfig";
import {
  formateAmount,
  isTransactionAction,
} from "../../../helpers/commonFunctions";
import { creditDebitEnum, transactionTypeEnum } from "../../../helpers/enum";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import DeleteRecordModal from "../../../components/admin/modals/deleteModals/DeleteRecordModal";
import { format, isToday, isYesterday } from "date-fns";
import { IconsImage } from "../../../data/images";

const AccountRecords = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleData } = useSelector((store) => store.Account);
  const { user } = useSelector((store) => store.Auth);
  const { data, paginationData, loading } = useSelector(
    (store) => store.Transaction
  );
  const [limit] = useState(10);
  const flatData = data?.flatMap((item) => item?.transaction);
  const [selectedAccountType, setSelectedAccountType] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isDeleteRecord, setIsDeleteRecord] = useState(false);
  const [selectedId, setSelectedId] = useState([]);
  const [active, setActive] = useState(1);
  const { id } = useParams();
  const checkPermission = isTransactionAction({ id: id });
  const triggerDeleteAccount = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Account Delete",
    text: "Are you sure you want to delete this account? This change cannot be undone.",
    confirmButtonText: "Delete Account",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Account has been successfully deleted.",
  });
  const triggerDeleteRecord = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Record Delete",
    text: "Are you sure you want to delete this account? This change cannot be undone.",
    confirmButtonText: "Delete Record",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Record has been successfully deleted.",
  });

  const activeHandler = (page) => {
    setActive(page);
  };

  const handleSelectAllRecord = (e) => {
    if (e.target.checked) {
      setSelectedId(flatData);
    } else {
      setSelectedId([]);
    }
  };

  const handleSelectRecord = (e, item) => {
    // setSelectedId(id);
    if (e.target.checked) {
      setSelectedId((pre) => [...pre, item]);
    } else {
      setSelectedId((pre) => pre.filter((value) => value !== item));
    }
  };

  const countTotalAmount = () => {
    const selectedIdTotal = selectedId?.reduce((acc, curr) => {
      return curr?.type == transactionTypeEnum.INCOME
        ? acc + curr?.amount
        : acc - curr?.amount;
    }, 0);
    const allIdTotal = flatData?.reduce((acc, curr) => {
      return curr?.type == transactionTypeEnum.INCOME
        ? acc + curr?.amount
        : acc - curr?.amount;
    }, 0);
    return selectedIdTotal || allIdTotal;
  };

  const handleDeleteAccount = () => {
    // triggerDeleteAccount({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteAccountThunk(singleData?._id));
    //     if (deleteAccountThunk.fulfilled.match(response)) {
    //       navigate(ADMIN.ACCOUNTS.PATH);
    //       return true;
    //     }
    //   },
    // });
    setIsDelete(true);
  };

  const handleDeleteRecord = async () => {
    if (selectedId?.length > 0) {
      setIsDeleteRecord(true);
    } else {
      toastError("Select at least one record for delete");
    }
  };

  const handleEditAccount = () => {
    dispatch(getAccountDetailsThunk(id));
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false), setIsDeleteRecord(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteAccountThunk(singleData?._id));
    if (deleteAccountThunk.fulfilled.match(response)) {
      navigate(ADMIN.ACCOUNTS.PATH);
      return true;
    }
    return false;
  }, [singleData, dispatch, navigate]);

  const handleConfirmDeleteRecord = useCallback(async () => {
    const allIds = selectedId?.map((item) => item?._id);
    const response = await dispatch(
      deleteMultipleTransactionThunk({ ids: allIds })
    );
    if (deleteMultipleTransactionThunk.fulfilled.match(response)) {
      setSelectedId([]);
      dispatch(
        getTransactionThunk({ accounts: [id, id], limit, page: active })
      );
      return true;
    }
    return false;
  }, [active, limit, id, selectedId, dispatch]);

  useEffect(() => {
    if (Object.keys(singleData).length === 0)
      dispatch(getAccountDetailsThunk(id));
  }, [dispatch, id, singleData]);

  useEffect(() => {
    dispatch(getTransactionThunk({ accounts: [id, id], limit, page: active }));
  }, [dispatch, id, limit, active]);
  return (
    <div className={`account-balance py-3 responsive`}>
      <div className={`mb-3`}>
        <PageTitle
          onSuccess={useCallback(
            () =>
              dispatch(
                getTransactionThunk({ accounts: [id, id], limit, page: active })
              ),
            [id, limit, active]
          )}
          title={"Accounts"}
          subTitle="In this report, you will find your wallet status."
        />
      </div>
      {singleData?._id ? (
        <>
          <div
            className={`bg-white border common-border-color pt-20px rounded-4 overflow-hidden`}
          >
            <div
              className={`d-flex align-items-center gap-3 px-20px overflow-auto overflow-scroll-design justify-content-between pb-20px position-relative divider`}
            >
              <div className={`d-flex align-items-center gap-3`}>
                <div
                  className={`br-21 w-65px min-w-65px aspect-square h-100 light-primary-shadow responsive-icon`}
                >
                  <img
                    src={
                      import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                      singleData?.accountType?.icon
                    }
                    alt={`account-icon-${singleData?._id}`}
                    className={`w-100 h-100 object-fit-cover br-12`}
                  />
                </div>
                <div className={`max-w-300px text-truncate`}>
                  <h4
                    className={`fs-17 fw-normal text-color-monsoon lh-base mb-0`}
                  >
                    Type
                  </h4>
                  <span
                    className={`text-capitalize fs-17 lh-base fw-medium text-dark mb-0`}
                  >
                    {singleData?.accountType?.title}
                    {/* {singleData?.accountType?.title} Type */}
                  </span>
                </div>
                <div className={`max-w-300px text-truncate`}>
                  <h4
                    className={`fs-17 fw-normal text-color-monsoon lh-base mb-0`}
                  >
                    Name
                  </h4>
                  <span
                    className={`text-capitalize fs-17 lh-base fw-medium text-dark mb-0`}
                  >
                    {singleData?.title}
                  </span>
                </div>
              </div>
              {checkPermission && (
                <div className={`d-flex align-items-center gap-2 action-icons`}>
                  <Button
                    className="me-1 bg-color-blue-10 border-color-blue br-10 h-40px aspect-square d-flex align-items-center justify-content-center hover-bg-blue-text-white text-color-blue transition"
                    onClick={() => setSelectedAccountType(true)}
                  >
                    <i className="ri-pencil-line fs-18 fw-medium lh-0"></i>
                  </Button>
                  <Button
                    className="bg-color-invalid-10 border-color-invalid br-10 h-40px aspect-square d-flex align-items-center justify-content-center hover-bg-invalid-text-white text-color-invalid transition"
                    onClick={handleDeleteAccount}
                  >
                    <i className="ri-delete-bin-line fs-18 fw-medium lh-0"></i>
                  </Button>
                </div>
              )}
            </div>
            <div
              className={`pt-3 d-flex align-items-center overflow-auto invisible-scrollbar gap-3 px-20px`}
            >
              {subPagesNavItems.map((ele, index) => {
                const title = ele.title;
                return (
                  <Button
                    onClick={() =>
                      navigate(
                        `${ADMIN.ACCOUNTS.PATH}/${singleData?._id}/${title}`
                      )
                    }
                    key={index}
                    className={`rounded-0 border-start-0 border-top-0 border-end-0 bg-transparent p-0 m-0 px-4 pb-2 hover-color-dark hover-border-color-primary transition border-2 ${
                      location.pathname.includes(title)
                        ? "text-dark-primary border-color-primary"
                        : "text-color-inactive border-transparent"
                    } fs-18 fw-medium lh-base text-capitalize`}
                  >
                    {title}
                  </Button>
                );
              })}
            </div>
          </div>
          <div
            className={`bg-white border common-border-color overflow-hidden rounded-4 mt-3`}
          >
            {/* <PaginationDiv
              active={active}
              limit={customPaginationLimit}
              totalItems={singleCustomerDetails?.orders?.length}
              size={Math.ceil(
                singleCustomerDetails?.orders?.length / customPaginationLimit
              )}
              step={1}
              icons={true}
              onClickHandler={(value) => activeHandler(value)}
            /> */}
            {!flatData?.length && !loading ? (
              <DynamicLordIcon
                coverClass="bg-white"
                icon="wzwygmng"
                subTitle="No records found for the provided record."
                title="Oops! records Not Found!"
              />
            ) : (
              <Table responsive className="account-record w-100 mb-0">
                <thead>
                  <tr>
                    <td
                      colSpan={2}
                      className={`p-3 border-bottom common-border-color`}
                    >
                      {!loading ? (
                        <span
                          className={`client-section-bg-color fs-14 br-10 py-1 px-2`}
                        >
                          {flatData?.length} Records
                        </span>
                      ) : (
                        <Placeholder animation="glow">
                          <Placeholder
                            className={`bg-color-gray br-10 h-100 w-180px`}
                            xs={2}
                          />
                        </Placeholder>
                      )}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {checkPermission && (
                    <tr className={`user-select-none align-middle`}>
                      <td className={`text-truncate border-0 p-3`}>
                        {!loading ? (
                          <Form.Check
                            className="square-check text-color-monsoon fs-16 fw-normal text-capitalize cursor-pointer"
                            type={"checkbox"}
                            id={`all-account`}
                            label={`select all`}
                            checked={selectedId?.length == flatData?.length}
                            onChange={handleSelectAllRecord}
                          />
                        ) : (
                          <Placeholder animation="glow">
                            <Placeholder
                              className={`bg-color-gray br-10 h-100 w-180px`}
                              xs={2}
                            />
                          </Placeholder>
                        )}
                      </td>
                      <td
                        className={`text-truncate d-flex align-items-center justify-content-end border-0 gap-2 p-3`}
                      >
                        {!loading ? (
                          <Button
                            // disabled={selectedId?.length > 0 ? false : true}
                            className={`bg-color-invalid-10 border-color-invalid br-8 h-40px aspect-square d-flex align-items-center justify-content-center hover-bg-invalid-text-white text-color-invalid transition`}
                            onClick={handleDeleteRecord}
                          >
                            <i className="ri-delete-bin-line fs-18 fw-medium lh-0"></i>
                          </Button>
                        ) : (
                          <Placeholder animation="glow">
                            <Placeholder
                              className={`bg-color-gray br-10 h-40px w-40px`}
                              xs={2}
                            />
                          </Placeholder>
                        )}
                        {!loading ? (
                          <span
                            className={`${
                              countTotalAmount() >= 0
                                ? "text-color-light-green"
                                : "text-color-invalid"
                            } fs-16 fw-medium`}
                          >
                            {/* {countTotalAmount() >= 0 ? "+ " : "- "} */}
                            {formateAmount({ price: countTotalAmount() })}
                          </span>
                        ) : (
                          <Placeholder animation="glow">
                            <Placeholder
                              className={`bg-color-gray br-10 h-100 w-100px`}
                              xs={2}
                            />
                          </Placeholder>
                        )}
                      </td>
                    </tr>
                  )}
                  {loading ? (
                    <RecordsLoader length={flatData.length} limit={limit} />
                  ) : (
                    flatData?.map((item, index1) => {
                      const title = item?.category?.title;
                      const creditDebit = item?.creditDebit;
                      const toAccountTitle = item?.to?.title;
                      const accountTitle =
                        creditDebit == creditDebitEnum.DEBIT
                          ? toAccountTitle
                          : item?.account?.title;
                      const amount = item?.amount;
                      const type = item?.type;
                      const icon =
                        type == transactionTypeEnum.TRANSFER
                          ? creditDebit == creditDebitEnum.CREDIT
                            ? IconsImage.other.creditTransferIcon
                            : IconsImage.other.debitTransferIcon
                          : import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                            item?.category?.icon;
                      const currencySymbol = item?.currency?.symbol;
                      const createdByUser =
                        (item?.user?._id !== user?._id &&
                          item?.user?.username) ||
                        "";
                      const note = item?.note;
                      const payee = item?.payee?.name || "";
                      const labels = item?.labels;
                      const date = item?.date;
                      const formattedDate = isToday(date)
                        ? "Today"
                        : isYesterday(date)
                        ? "Yesterday"
                        : format(date, "dd MMM yyyy");

                      const formattedTime = format(date, "h:mm a");
                      const toAccount = item?.to?.title || "";

                      return (
                        <tr key={index1}>
                          <td
                            className={`${
                              (index1 + 1) % 2 !== 0
                                ? "client-section-bg-color"
                                : ""
                            } p-3 border-0`}
                          >
                            <div className="d-flex gap-3">
                              {checkPermission && (
                                <Form.Check
                                  checked={selectedId.some(
                                    (value) => value?._id == item?._id
                                  )}
                                  onChange={(e) => handleSelectRecord(e, item)}
                                  className="square-check text-color-light-gray fs-18 mt-1"
                                  type={"checkbox"}
                                  id={index1}
                                  // label={`select all account`}
                                  // checked={isAccountChecked}
                                  // onChange={handleAccountCheckbox}
                                />
                              )}
                              <img
                                src={icon}
                                className="w-40px h-40px br-8"
                                alt=""
                              />
                              <span>
                                <h6 className="max-w-300px text-truncate p-0 m-0 fs-16 text-capitalize pe-5">
                                  {type == transactionTypeEnum.TRANSFER
                                    ? "Transfer"
                                    : title}
                                </h6>
                                <span className="fs-14 text-color-monsoon text-capitalize max-w-300px text-truncate d-block mt-1">
                                  {/* {accountTitle} */}
                                  {type == transactionTypeEnum.TRANSFER ? (
                                    <span>
                                      <span
                                        className={`${
                                          creditDebit == creditDebitEnum.DEBIT
                                            ? ""
                                            : "text-color-light-gray"
                                        }`}
                                      >
                                        {item?.account?.title}{" "}
                                      </span>
                                      <i className="ri-arrow-right-long-fill"></i>{" "}
                                      <span
                                        className={`${
                                          creditDebit == creditDebitEnum.DEBIT
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
                                  <span className="fs-13 text-color-monsoon text-capitalize max-w-300px text-truncate d-block mt-1">
                                    Note: {note}
                                  </span>
                                )}
                                {payee && (
                                  <span className="fs-13 text-color-monsoon text-capitalize max-w-300px text-truncate d-block mt-1">
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
                                            backgroundColor: item?.color,
                                          }}
                                          className="fs-12 text-white px-2 py-1 br-5 max-w-300px text-truncate"
                                        >
                                          {item?.title}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`text-truncate ${
                              (index1 + 1) % 2 !== 0
                                ? "client-section-bg-color"
                                : ""
                            } p-3 border-0 text-end`}
                          >
                            <span className="d-flex flex-column align-items-end">
                              <span
                                className={`${
                                  type == transactionTypeEnum.INCOME ||
                                  creditDebit == creditDebitEnum.CREDIT
                                    ? "text-color-light-green"
                                    : type == transactionTypeEnum.EXPENSE ||
                                      creditDebit == creditDebitEnum.DEBIT
                                    ? "text-color-invalid"
                                    : ""
                                } fs-15 fw-medium text-nowrap`}
                              >
                                {type == transactionTypeEnum.INCOME ||
                                creditDebit == creditDebitEnum.CREDIT
                                  ? "+ "
                                  : type == transactionTypeEnum.EXPENSE ||
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
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            )}
            {flatData?.length > 0 && !loading ? (
              <div className={`p-3`}>
                <PaginationDiv
                  active={active}
                  limit={limit}
                  totalItems={paginationData?.totalItems}
                  size={paginationData?.totalPages}
                  step={1}
                  icons={true}
                  onClickHandler={(value) => activeHandler(value)}
                />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <DynamicLordIcon
          coverClass="admin-primary-bg"
          icon="bgebyztw"
          subTitle="No account details found for the provided ID."
          title="Oops! Account Not Found!"
        />
      )}
      <AddEditAccountModal
        isOpen={selectedAccountType}
        onHide={() => setSelectedAccountType(false)}
        item={singleData}
        onSuccess={handleEditAccount}
      />
      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Account",
          description: "Are you sure you want to delete the Account?",
        }}
        onConfirm={handleConfirm}
        loading={loading}
      />
      <DeleteRecordModal
        isOpen={isDeleteRecord}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        data={selectedId}
        onConfirm={handleConfirmDeleteRecord}
        loading={loading}
      />
    </div>
  );
};

export default AccountRecords;
