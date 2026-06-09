import PropTypes from "prop-types";
import { Button, Col, Row } from "react-bootstrap";
import AddEditRecord from "../modals/AddEditRecord";
import { memo, useCallback, useState } from "react";
import AccountTypeModel from "../modals/AccountTypeModel";
import AddEditAccountModal from "../modals/AddEditAccountModal";
import AlertModal from "../modals/AlertModal";
import { addAccount } from "../../../helpers/enum";
import { useSelector } from "react-redux";

const PageTitle = memo(function PageTitle({
  title,
  subTitle,
  setCanvas,
  filterButton = false,
  filterIcon = "ri-equalizer-line",
  onSuccess,
  buttonContent = "Add Record",
  onButtonClick,
  isButton = true,
  isAccountRequired = false,
}) {
  const { user } = useSelector((store) => store.Auth);
  const { singleUserGroupData } = useSelector((store) => store.Group);
  const { data: accountData } = useSelector((store) => store.Account);
  const [recordModel, setRecordModel] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [accountTypeModel, setAccountTypeModel] = useState(false);
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

  const handleOpenDirect = useCallback(() => {
    setRecordModel(true);
  }, []);

  const handleCloseRecordModal = useCallback(() => {
    setRecordModel(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    isAccountRequired && !accountData?.length > 0
      ? handleOpenAlert()
      : setRecordModel(true);
  }, [accountData?.length, handleOpenAlert, isAccountRequired, isAdmin]);

  const handleOnButtonClick = useCallback(() => {
    isAccountRequired && !accountData?.length > 0
      ? handleOpenAlert()
      : onButtonClick();
  }, [
    onButtonClick,
    isAccountRequired,
    accountData?.length,
    handleOpenAlert,
    isAdmin,
  ]);

  return (
    <>
      <Row className="align-items-center justify-content-between">
        <Col sm={12} md={8} className={`mb-3 mb-md-0`}>
          <h1 className="fs-22 mb-1 admin-main-title fw-semibold">{title}</h1>
          <p className="text-color-light-gray fs-14 m-0">{subTitle}</p>
        </Col>
        <Col
          sm={12}
          md={4}
          className={`d-flex flex-wrap align-items-center justify-content-between justify-content-md-end gap-3`}
        >
          {isButton && (
            <Button
              className="primary-white-btn order-1 order-sm-0 order-lg-1  v-fit py-1 br-10  hover-bg-color-primary hover-text-color-white hover-text-color-white-i text-dark-primary d-flex align-items-center border border-color-primary px-3 gap-1 "
              onClick={() =>
                onButtonClick ? handleOnButtonClick() : handleOpenModal()
              }
            >
              <i className="ri-add-line fs-22 text-color-primary transition"></i>{" "}
              <span className="text-nowrap fs-15 responsive text-capitalize">
                {buttonContent}
              </span>
            </Button>
          )}
          {/* <Button
            className="transition primary-white-btn focus-bg-color-primary v-fit py-1 br-8 bg-white hover-text-color-white-i hover-bg-color-primary hover-text-color-white text-dark-primary d-flex align-items-center border border-color-primary px-3 gap-0"
            onClick={() => setRecordModel(true)}
          >
            <i className="transition ri-add-line fs-22 text-color-primary"></i>
            <span className={`fs-15`}>Add Record</span>
          </Button> */}
          {filterButton && (
            <Button
              className="bg-white common-border-color br-10 h-100 aspect-square d-flex d-lg-none align-items-center justify-content-center"
              onClick={() => setCanvas(true)}
            >
              <i
                className={`${filterIcon} fs-18 fw-medium text-color-gray`}
              ></i>
            </Button>
          )}
        </Col>
      </Row>
      <AddEditRecord
        onSuccess={onSuccess && onSuccess}
        isOpen={recordModel}
        onHide={handleCloseRecordModal}
        open={handleOpenDirect}
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

      {/* <AlertModal
        onClose={handleCloseAlert}
        isOpen={alertModal}
        onConfirm={handleOpenAccType}
      /> */}

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
});

PageTitle.propTypes = {
  title: PropTypes.any,
  filterButton: PropTypes.any,
  subTitle: PropTypes.any,
  setCanvas: PropTypes.any,
  filterIcon: PropTypes.any,
  onSuccess: PropTypes.func,
  buttonContent: PropTypes.string,
  onButtonClick: PropTypes.func,
  isButton: PropTypes.bool,
  isAccountRequired: PropTypes.bool,
};

export default PageTitle;
