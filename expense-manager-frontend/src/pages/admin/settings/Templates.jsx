import { useCallback, useEffect, useState } from "react";
import SettingLayout from "./Layout";
import TemplateModal from "../../../components/admin/modals/TemplateModal";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  deleteTemplateThunk,
  getTemplateThunk,
} from "../../../store/template/thunk";
import { Table } from "react-bootstrap";
import {
  formateAmount,
  isTransactionAction,
} from "../../../helpers/commonFunctions";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import NoData from "../../../components/admin/NoData";
import { addAccount, transactionTypeEnum } from "../../../helpers/enum";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import { IconsImage } from "../../../data/images";
import AddEditRecord from "../../../components/admin/modals/AddEditRecord";
import TemplateLoading from "./loaders/TemplateLoading";
import { setStateTemplateData } from "../../../store/transaction/slice";
import AlertModal from "../../../components/admin/modals/AlertModal";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";

const Templates = () => {
  const { data, loading } = useSelector((store) => store.Template);
  const { data: accountData } = useSelector((store) => store.Account);

  const [isTempModal, setIsTempModal] = useState(false);
  const [isRecordModal, setIsRecordModal] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isDelete, setIsDelete] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");

  const dispatch = useDispatch();
  const handleOpenModal = useCallback(() => setIsTempModal(true), []);

  const handleCloseModal = useCallback(() => {
    setIsTempModal(false), setEditData({}), setIsRecordModal(false);
  }, []);

  const handleEdit = useCallback((values) => {
    setIsTempModal(true), setEditData(values), setOpenId(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false);
    setDeleteId(null);
  }, []);

  const handleOpenAlert = useCallback(() => {
    setAlertModal(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertModal(false);
  }, []);

  const handleOpenDelete = useCallback((id) => {
    setIsDelete(true), setDeleteId(id);
  }, []);

  const handleOpenAccType = useCallback(() => {
    setAccountTypeModel(true);
    setAlertModal(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    await dispatch(deleteTemplateThunk(deleteId));
  }, [deleteId, dispatch]);

  const handleOpenRecordModal = useCallback((data) => {
    setEditData(data);
    setIsRecordModal(true);
  }, []);

  const openTemModalDirect = useCallback(() => {
    setIsTempModal(true);
  }, []);

  const closeTemModalDirect = useCallback(() => {
    setIsTempModal(false);
  }, []);

  const openRecordModalDirectly = useCallback(() => {
    setIsRecordModal(true);
  }, []);

  const handleAccSelectType = useCallback((type) => {
    setSelectedAccountType(type);
  }, []);

  const handleCloseAccType = useCallback(() => {
    setAccountTypeModel(false);
  }, []);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType("");
  };

  useEffect(() => {
    dispatch(getTemplateThunk());
  }, []);

  return (
    <>
      <SettingLayout
        // onClick={handleModals}
        pageTitleData={{
          buttonContent: "Add Template",
          onButtonClick: handleOpenModal,
          // isButton: isAdmin,
        }}
      >
        {data?.length || loading ? (
          <Table responsive className={`align-middle mb-0`}>
            <thead>
              <tr className="responsive">
                <th
                  className={`text-truncate border-bottom-0 text-capitalize p-3`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    icon
                  </span>
                </th>
                <th
                  className={`text-truncate border-bottom-0 text-capitalize p-3`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    name
                  </span>
                </th>
                <th
                  className={`text-truncate border-bottom-0 text-capitalize p-3`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    amount
                  </span>
                </th>
                <th
                  className={`text-truncate border-bottom-0 text-capitalize p-3`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    account
                  </span>
                </th>
                <th
                  className={`text-truncate border-bottom-0 text-capitalize p-3`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    type
                  </span>
                </th>
                {/* <th
                  className={`text-truncate border-bottom-0 text-capitalize p-3`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    Authority
                  </span>
                </th> */}
                <th
                  className={`text-truncate text-end border-bottom-0 text-capitalize p-3 w-30px`}
                >
                  <span
                    className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                  >
                    options
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TemplateLoading />
              ) : (
                //  : !data?.length ? (
                //   <tr>
                //     <td colSpan={6} className="border-0 w-100">
                //       <DynamicLordIcon
                //         coverClass="bg-white"
                //         icon="bgebyztw"
                //         subTitle="Create an account to get started!"
                //         title="Oops! No Account Found!"
                //       />
                //     </td>
                //   </tr>
                // )
                data.map((ele, index) => {
                  const id = ele._id;
                  const icon =
                    import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                    ele?.category?.icon;
                  const title = ele?.title;
                  const accountTitle = ele?.account?.title;
                  const accountTypeTitle = ele?.account?.accountType?.title;
                  const symbol = ele?.currency?.symbol;
                  const balance = ele?.amount;
                  const type = ele?.type;
                  const isPermission = isTransactionAction({ id });
                  return (
                    <tr
                      key={id}
                      onClick={() => {
                        handleOpenRecordModal(ele),
                          dispatch(setStateTemplateData(ele));
                      }}
                    >
                      <td
                        className={`cursor-pointer min-w-85px w-85px ${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } text-truncate border-0 px-3 py-12px responsive`}
                      >
                        <div className={`br-10`}>
                          <img
                            src={icon}
                            alt={`account-icon-${index}`}
                            className={`h-50px w-50px object-fit-cover br-12`}
                          />
                        </div>
                      </td>
                      <td
                        className={`${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } cursor-pointer border-0 p-3 responsive`}
                      >
                        <span
                          className={`fs-18 max-w-300px text-truncate d-block fw-normal lh-base mb-0 text-capitalize`}
                        >
                          {title}
                        </span>
                      </td>
                      <td
                        className={`${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } cursor-pointer border-0 p-3 responsive`}
                      >
                        <div>
                          <span
                            className={`text-truncate fw-semibold max-w-300px d-block text-truncate fs-16 ${
                              type == transactionTypeEnum.INCOME
                                ? "text-color-light-green"
                                : "text-color-invalid"
                            }`}
                          >
                            {type == transactionTypeEnum.INCOME ? "+" : "-"}
                            {balance === 0
                              ? symbol + 0
                              : balance > 0
                              ? symbol + formateAmount({ price: balance })
                              : "-" +
                                symbol +
                                String(formateAmount({ price: balance })).split(
                                  "-"
                                )[1]}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } cursor-pointer border-0 p-3 responsive`}
                      >
                        <span
                          className={`fs-18 fw-normal text-truncate max-w-300px d-block text-table-head-color lh-base mb-0`}
                        >
                          {accountTitle}
                        </span>
                      </td>
                      <td
                        className={`${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } text-truncate cursor-pointer border-0 p-3 responsive`}
                      >
                        <span
                          className={`fs-18 fw-normal text-table-text-color lh-base mb-0`}
                        >
                          {accountTypeTitle}
                        </span>
                      </td>

                      {/* <td
                        className={`${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } text-truncate cursor-pointer border-0 p-3 responsive`}
                      >
                        <span
                          className={`${
                            isPermission
                              ? "text-color-light-green border-color-light-green"
                              : "text-color-invalid border-color-invalid"
                          } fs-14 border px-3 br-5 py-1`}
                        >
                          {isPermission ? "Access" : "No Access"}
                        </span>
                      </td> */}
                      <td
                        className={`${
                          index % 2 == 0 ? "client-section-bg-color" : ""
                        } cursor-pointer border-0 p-3 text-center `}
                      >
                        {isPermission ? (
                          <ToggleMenu
                            rootClass={"tbody"}
                            onClose={() => setOpenId("")}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openId == id) {
                                setOpenId("");
                              } else {
                                setOpenId(id);
                              }
                            }}
                            isOpen={openId == id}
                          >
                            <p
                              className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(ele);
                                dispatch(setStateTemplateData(ele));
                              }}
                            >
                              Edit
                            </p>
                            <p
                              onClick={() => handleOpenDelete(id)}
                              className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                            >
                              Delete
                            </p>
                          </ToggleMenu>
                        ) : (
                          <i className="ri-more-2-fill fs-18 text-color-light-gray"></i>
                        )}
                        {/* <div
                      className={`d-flex align-items-center justify-content-end gap-2`}
                    >
                      <Button
                        onClick={() => handleDeleteRecord(id)}
                        className={`bg-transparent p-0 m-0 border-0`}
                      >
                        <i className="fs-5 fw-normal text-color-invalid ri-delete-bin-6-fill"></i>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(), handleEditAccount(ele);
                        }}
                        className={`bg-transparent p-0 m-0 border-0`}
                      >
                        <i className="fs-5 fw-normal text-color-primary ri-edit-2-fill"></i>
                      </Button>
                    </div> */}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        ) : (
          <NoData
            className="mt-0 rounded-0 border-0 height-with-table-header rounded-bottom-4 w-100"
            title="No Templates Found"
            description="You haven’t added any Template yet. Link or create one to get started"
            buttonContent="Add Template"
            onButtonClick={
              !accountData?.length > 0 ? handleOpenAlert : handleOpenModal
            }
          />
        )}
      </SettingLayout>

      <TemplateModal
        isOpen={isTempModal}
        onClose={handleCloseModal}
        editData={editData}
        open={openTemModalDirect}
        close={closeTemModalDirect}
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{ title: "Are you sure you want to Delete the Template?" }}
        onConfirm={handleConfirm}
        loading={loading}
        icon={IconsImage.other.record}
      />

      <AddEditRecord
        isOpen={isRecordModal}
        onHide={handleCloseModal}
        templateData={editData}
        open={openRecordModalDirectly}
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
        onConfirm={() => {
          handleOpenAccType();
          handleCloseAlert();
        }}
      />
    </>
  );
};

export default Templates;
