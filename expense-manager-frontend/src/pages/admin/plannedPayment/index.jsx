import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlannedPaymentModal from "../../../components/admin/modals/plannedPaymentModals/PlannedPaymentModal";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import TableTitle from "../../../components/admin/pageTitle/TableTitle";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  getPlannedByFiltersThunk,
  getPlannedThunk,
} from "../../../store/planned/thunk";
import PlannedPaymentRecords from "./PlannedPaymentRecords";
import EditPlannedModal from "../../../components/admin/modals/plannedPaymentModals/EditPlannedModal";
import { Button, Col } from "react-bootstrap";
import FilterModal from "../../../components/admin/modals/plannedPaymentModals/filterModals/FilterModal";
import NoData from "../../../components/admin/NoData";
import AlertModal from "../../../components/admin/modals/AlertModal";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import { addAccount, subscriptionTypeEnum } from "../../../helpers/enum";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import { isPremium } from "../../../helpers/commonFunctions";

const PlannedPayment = () => {
  const { singleUserGroupData } = useSelector((store) => store.Group);
  const { user } = useSelector((store) => store.Auth);
  const { data: accountData } = useSelector((store) => store.Account);
  const { data, filterOptions, loading, accessLimit } = useSelector(
    (store) => store.Planned
  );
  const isAdmin = singleUserGroupData?.createBy?._id
    ? user?._id == singleUserGroupData?.createBy?._id
    : true;
  const previousData = useRef(filterOptions);
  const dispatch = useDispatch();

  const [isModal, setIsModal] = useState(false);
  const [currentSubModal, setCurrentSubModal] = useState("");
  const [isEditModal, setIsEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [isFilterModal, setIsFilterModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [premiumModel, setPremiumModel] = useState("");

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleOpenEditModal = useCallback(() => {
    setIsEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModal(false);
  }, []);

  const handleOpenNClearModal = useCallback(() => {
    if (editData?._id) {
      setEditData({});
    }
    setIsModal(true);
  }, [editData?._id]);

  const handleEditData = useCallback((values) => {
    setEditData(values), handleOpenEditModal();
  }, []);

  const handleClearEditData = useCallback(() => {
    setEditData({});
  }, []);

  const handleOpenWithClear = useCallback(() => {
    if (isPremium() || data.length < accessLimit) {
      setIsModal(true);
    } else {
      setPremiumModel(true);
    }
    setEditData({});
  }, [accessLimit, data, user]);

  const handleFilterModal = useCallback(() => {
    setIsFilterModal(!isFilterModal);
  }, [isFilterModal]);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType("");
  };

  const handleSubModalOpen = useCallback(() => {
    handleCloseModal();
    setCurrentSubModal("editDetails");
  }, []);

  const handleAccSelectType = useCallback((type) => {
    setSelectedAccountType(type);
  }, []);

  const handleOpenAlert = useCallback(() => {
    setAlertModal(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertModal(false);
    // setAccountTypeModel(false);
  }, []);

  const handleOpenAccType = useCallback(() => {
    setAccountTypeModel(true);
    setAlertModal(false);
  }, []);

  const handleCloseAccType = useCallback(() => {
    setAccountTypeModel(false);
  }, []);

  const handleFilterAPI = useCallback(() => {
    // if (
    //   JSON.stringify(previousData?.current) !== JSON.stringify(filterOptions)
    // ) {
    //   previousData.current = filterOptions;
    dispatch(getPlannedByFiltersThunk({ ...filterOptions }));
    // }
  }, [filterOptions, previousData]);

  useEffect(() => {
    if (!data?.length) {
      dispatch(getPlannedThunk());
    }
  }, []);

  useEffect(() => {
    dispatch(getPlannedByFiltersThunk({ ...filterOptions, page: 1 }));
  }, [dispatch, filterOptions]);

  return (
    <>
      <div className="pt-4">
        <PageTitle
          filterButton={false}
          title="Planned Payment"
          subTitle="Effortlessly schedule and manage your payments"
          buttonContent="Add Planned Payment"
          onButtonClick={handleOpenWithClear}
          isAccountRequired
        />

        <TableTitle
          // count={data?.length}
          title="Planned Payment"
          // buttonContent="Add Planned Payment"
          onClick={handleOpenNClearModal}
          customBtn={
            <Button
              onClick={handleFilterModal}
              className="primary-white-btn py-2 v-fit  br-8 hover-bg-color-primary hover-text-color-white hover-text-color-white-i text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-1 text-capitalize btn btn-primary fs-15"
            >
              <i className="transition ri-add-line text-table-head-color ri-filter-line me-1"></i>
              Filter
            </Button>
          }
        />
        {loading || data?.length > 0 ? (
          <>
            <PlannedPaymentRecords data={data} handleEdit={handleEditData} />
          </>
        ) : (
          <NoData
            className="mt-0 rounded-0 border-top-0  height-with-table-header rounded-bottom-4 w-100 px-4 mb-3"
            title="No Planned Payment Found"
            description="Add your upcoming payments to stay on top of your  schedule and avoid missing due dates."
            buttonContent="Add Planned Payment"
            onButtonClick={
              !accountData?.length > 0 ? handleOpenAlert : handleOpenNClearModal
            }
          />
        )}

        <PlannedPaymentModal
          isOpen={isModal}
          onClose={handleCloseModal}
          open={handleOpenModal}
          editData={editData}
          onSuccess={handleClearEditData}
        />

        <EditPlannedModal
          isOpen={isEditModal}
          onClose={handleCloseEditModal}
          editData={editData}
          open={handleOpenEditModal}
          handleOpenSubModal={handleSubModalOpen}
          handleClickOnEdit={handleOpenModal}
        />

        {/* <EditGeneralDetailsModal
        isOpen={currentSubModal == "editDetails"}
        onClose={handleCloseSubModal}
        editData={editData}
        open={handleSubModalOpen}
      /> */}

        <FilterModal
          isOpen={isFilterModal}
          onClose={handleFilterModal}
          open={handleFilterModal}
          onSuccess={handleFilterAPI}
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

        <PremiumModal
          isShow={premiumModel}
          onHide={() => setPremiumModel(false)}
        />

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
            isAdmin ? handleOpenAccType() : setAccountTypeModel(false);
            handleCloseAlert();
          }}
        />
      </div>
    </>
  );
};

export default memo(PlannedPayment);
