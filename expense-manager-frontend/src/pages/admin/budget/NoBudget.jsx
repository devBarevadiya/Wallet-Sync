import { memo, useCallback, useState } from "react";
import { Image } from "../../../data/images";
import { Button } from "react-bootstrap";
import BudgetModal from "../../../components/admin/modals/budgetModals";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import AlertModal from "../../../components/admin/modals/AlertModal";
import { addAccount } from "../../../helpers/enum";
import { useSelector } from "react-redux";
import {
  setHeadCategoryAmounts,
  setSubCategoryAmounts,
} from "../../../store/budget/slice";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import NoData from "../../../components/admin/NoData";

const NoBudget = ({ user = {} }) => {
  const { data: accountData } = useSelector((store) => store.Account);
  const { singleUserGroupData } = useSelector((store) => store.Group);
  const [isModal, setIsModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const dispatch = useDispatch();
  const isAdmin = singleUserGroupData?.createBy?._id
    ? user?._id == singleUserGroupData?.createBy?._id
    : true;
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

  const handleOpenModal = useCallback(() => {
    dispatch(setSubCategoryAmounts({}));
    dispatch(setHeadCategoryAmounts({}));
    !accountData?.length > 0 ? handleOpenAlert() : setIsModal(true);
  }, [accountData, handleOpenAlert]);

  const directOpen = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  return (
    <>
      <NoData onButtonClick={handleOpenModal} />

      <BudgetModal
        isOpen={isModal}
        onClose={handleCloseModal}
        open={directOpen}
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
    </>
  );
};

NoBudget.propTypes = {
  user: PropTypes.object,
};

export default memo(NoBudget);
