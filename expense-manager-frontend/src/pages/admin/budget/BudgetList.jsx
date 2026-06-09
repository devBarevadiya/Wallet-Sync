import { Button, Col, Row } from "react-bootstrap";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import BudgetModal from "../../../components/admin/modals/budgetModals";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { addAccount, budgetStatusType } from "../../../helpers/enum";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import { useDispatch } from "react-redux";
import {
  deleteBudgetThunk,
  getBudgetByPaginationThunk,
  getBudgetThunk,
  updateBudgetThunk,
} from "../../../store/actions";
import {
  clearCategoryData,
  setHeadCategoryAmounts,
  setSelectHeadCategory,
  setSelectedSubCategory,
  setShowSubCategories,
  setSubCategoryAmounts,
  updateStatus,
} from "../../../store/budget/slice";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import {
  capitalizeFirstLetter,
  formateAmount,
  isNotPremium,
} from "../../../helpers/commonFunctions";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import AlertModal from "../../../components/admin/modals/AlertModal";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import BudgetLoading from "./BudgetLoading";
import PremiumModal from "../../../components/admin/modals/PremiumModal";

const BudgetList = () => {
  const [isModal, setIsModal] = useState();
  const [openId, setOpenId] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const { data, loading, pagination, paginationLoading, accessLimit } =
    useSelector((state) => state.Budget);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const { data: accountData } = useSelector((store) => store.Account);
  const [alertModal, setAlertModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isPremiumModal, setIsPremiumModal] = useState(false);
  const currencySymbol = baseCurrency?.symbol;
  const dispatch = useDispatch();
  const nav = useNavigate();

  const page = pagination?.page;
  const totalPages = pagination?.totalPages;

  const handleOpenModal = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleOpenPremiumModal = useCallback(() => {
    setIsPremiumModal(true);
  }, []);

  const handleClosePremiumModal = useCallback(() => {
    setIsPremiumModal(false);
  }, []);

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  // const fontFormatter = useCallback((value) => {
  //   return value?.split("_")?.join(" ");
  // }, []);

  const triggerDeleteRecord = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Budget Delete",
    text: "Are you sure you want to delete this Budget? This change cannot be undone.",
    confirmButtonText: "Delete Budget",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Budget has been successfully deleted.",
  });

  const handleDeleteBudget = async (id) => {
    // triggerDeleteRecord({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteBudgetThunk(id));
    //     if (deleteBudgetThunk.fulfilled.match(response)) {
    //       setOpenId("");
    //       await dispatch(getBudgetThunk());
    //       return true;
    //     }
    //   },
    // });
    setDeleteId(id);
    setIsDelete(true);
  };

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteBudgetThunk(deleteId));
    if (deleteBudgetThunk.fulfilled.match(response)) {
      setOpenId("");
      await dispatch(getBudgetThunk());
      setDeleteId(null);
      return true;
    }
    setDeleteId(null);
    return false;
  }, [dispatch, openId]);

  const updateData = useCallback(async (id, status) => {
    const response = await dispatch(
      updateBudgetThunk({ id, values: { status } })
    );
    if (updateBudgetThunk.fulfilled.match(response)) {
      dispatch(updateStatus({ id, status }));
    }
  }, []);

  const handleDetailsPage = useCallback((id) => {
    dispatch(setShowSubCategories({}));
    nav(`${ADMIN.BUDGET_DETAILS.PATH}/${id}`);
  }, []);

  const handleOpenAlert = useCallback(() => {
    setAlertModal(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertModal(false);
    // setAccountTypeModel(false);
  }, []);

  const handleAccSelectType = useCallback((type) => {
    setSelectedAccountType(type);
  }, []);

  const handleOpenAccType = useCallback((type) => {
    setAccountTypeModel(true);
    setAlertModal(false);
  }, []);

  const handleCloseAccType = useCallback(() => {
    setAccountTypeModel(false);
  }, []);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType("");
  };

  const handleOpenWithClearModal = useCallback(() => {
    if (isNotPremium() && data?.length >= accessLimit) {
      handleOpenPremiumModal();
    } else {
      dispatch(setSelectHeadCategory({}));
      dispatch(clearCategoryData());
      dispatch(setSelectedSubCategory({}));
      dispatch(setSubCategoryAmounts({}));
      dispatch(setHeadCategoryAmounts({}));
      !accountData?.length > 0 ? handleOpenAlert() : setIsModal(true);
    }
  }, [
    dispatch,
    accountData?.length,
    handleOpenAlert,
    handleOpenPremiumModal,
    accessLimit,
    data?.length,
  ]);

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  const handlePagination = useCallback(() => {
    dispatch(getBudgetByPaginationThunk({ page: page + 1 }));
  }, [page]);

  return (
    <div className="invisible-scrollbar mt-3 responsive">
      {loading ? (
        <BudgetLoading />
      ) : (
        <Row className="budget-list">
          <Col sm={6} lg={6} xl={3} className="mb-3 mb-sm-4">
            <div
              className="bg-white br-18 border-0  cursor-pointer h-100"
              onClick={handleOpenWithClearModal}
              //   onClick={() => {
              //     if (
              //       user.subscriptionType === subscriptionTypeEnum.PREMIUM ||
              //       data.length < accessLimit
              //     ) {
              //       setAccountTypeModel(true);
              //     } else {
              //       setPremiumModel(true);
              //     }
              //   }}
            >
              <div className="p-3 border common-border-color rounded-4 h-100">
                <div className="border-2 h-100 justify-content-center common-border-color border-dashed br-18 py-4 gap-2 d-flex flex-column align-items-center">
                  <span className="fs-16 fw-bold responsive bg-color-primary p-2 text-white rounded-circle d-flex align-items-center justify-content-center p-0">
                    {/* + */}
                    <i className="ri-add-large-line lh-1 fs-21 p-1"></i>
                  </span>
                  {/* <i className="ri-add-circle-line text-color-silver fw-light fs-28"></i> */}
                  <span className="text-center text-color-gray mt-1 d-block  fs-18 opacity-50 transition-opacity fw-medium">
                    Create New Budget
                  </span>
                </div>
              </div>
            </div>
          </Col>
          {data?.map((item, index) => {
            const id = item?._id;
            const name = item?.name;
            const period = item?.period;
            const status = item?.status;
            const spendAmount = item?.spendAmount;
            const maxAmount = item?.maxAmount;
            const formatePeriod = capitalizeFirstLetter(period);
            const spendInPercent = (spendAmount / maxAmount) * 100 || 0;
            return (
              <Col key={index} sm={6} lg={6} xl={3} className="mb-3 mb-sm-4">
                <div className="bg-white budget-list-card rounded-4 border common-border-color p-4 cursor-pointer">
                  <div onClick={() => handleDetailsPage(id)}>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        className="w-50px h-50px object-fit-cover br-12"
                        src="https://guardianshot.blr1.digitaloceanspaces.com/expense/avatar/e55ed62e-e51d-4367-83db-bc0a918c81c9.png"
                        // src="https://guardianshot.blr1.digitaloceanspaces.com/expense/account type/12466b7a-a9f6-41b0-977e-6ee9deaa5b85.png"
                        alt=""
                      />
                      <span className="d-flex w-100 flex-column gap-0">
                        <span className="d-flex w-100 align-items-center justify-content-between">
                          <span className="d-flex flex-wrap gap-2 align-items-center">
                            <span className="fs-16 text-capitalize fw-medium text-break text-wrap max-w-60p truncate-line-1">
                              {name}
                            </span>
                            <span className="client-section-bg-color text-color-gray px-2 py-1 rounded-3 fs-12">
                              {formatePeriod}
                            </span>
                          </span>
                          <ToggleMenu
                            margin={"m-0"}
                            rootClass={"budget-list"}
                            isOpen={openId == id}
                            onClose={() => setOpenId("")}
                            onClick={(e) => {
                              e.stopPropagation();
                              openId == id ? setOpenId("") : setOpenId(id);
                            }}
                          >
                            {/* <p className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg">
                            Open
                          </p>
                          <p className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg">
                            Close
                          </p> */}
                            <p
                              onClick={() =>
                                updateData(
                                  id,
                                  budgetStatusType.OPEN == status
                                    ? budgetStatusType.CLOSE
                                    : budgetStatusType.OPEN
                                )
                              }
                              className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                            >
                              {capitalizeFirstLetter(
                                budgetStatusType.OPEN == status
                                  ? budgetStatusType.CLOSE
                                  : budgetStatusType.OPEN
                              )}
                            </p>
                            <p
                              onClick={() => handleDeleteBudget(id)}
                              className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                            >
                              Delete
                            </p>
                          </ToggleMenu>
                        </span>
                        <span
                          className={`fs-12 ${
                            status == budgetStatusType.OPEN
                              ? "text-color-income bg-color-lightest-green"
                              : "text-color-expense bg-color-lightest-invalid"
                          }  px-2 py-1 w-fit rounded-3 mt-1`}
                        >
                          {capitalizeFirstLetter(status)}
                        </span>
                      </span>
                    </div>
                    <div className="d-flex align-items-end justify-content-between">
                      <span>
                        <span className="mt-3 d-block fw-medium">
                          {currencySymbol +
                            formateAmount({
                              price: spendAmount,
                            })}
                        </span>
                        <span className="d-block fs-12 text-color-monsoon">
                          {currencySymbol +
                            formateAmount({
                              price: maxAmount,
                            })}{" "}
                          {formatePeriod}
                        </span>
                      </span>
                      {spendInPercent > 100 && (
                        <span className="fs-12 text-color-invalid bg-color-lightest-invalid br-5 px-2 py-1">
                          Over Spent
                        </span>
                      )}
                    </div>
                    <span className="w-100 client-section-bg-color d-block rounded-1 mt-3 rounded-1 overflow-hidden">
                      <span
                        className="bg-color-primary d-block py-2"
                        style={{ width: spendInPercent + "%" }}
                      ></span>
                    </span>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {page < totalPages && (
        <Button
          onClick={handlePagination}
          disabled={paginationLoading}
          className="primary-btn mx-auto d-block br-8 mb-4"
        >
          {paginationLoading ? "Loading..." : "Load more"}
        </Button>
      )}

      {/* <Button className="primary-btn br-10 fs-16 mx-auto d-block">Load more</Button> */}
      <BudgetModal
        isOpen={isModal}
        onClose={handleCloseModal}
        open={handleOpenModal}
      />

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
        onConfirm={handleOpenAccType}
      />

      <PremiumModal isShow={isPremiumModal} onHide={handleClosePremiumModal} />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Budget",
          description: "Are you sure you want to delete the Budget?",
        }}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  );
};

export default BudgetList;
