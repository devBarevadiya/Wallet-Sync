import { useCallback, useEffect, useState } from "react";
import SettingLayout from "./Layout";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import { addAccount, subscriptionTypeEnum } from "../../../helpers/enum";
import { Table } from "react-bootstrap";
import {
  deleteAccountThunk,
  getAccountDetailsThunk,
  getAccountThunk,
} from "../../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import { ADMIN } from "../../../constants/routes";
import { BALANCE } from "../../../routes/AdminRoutes";
import { useNavigate } from "react-router-dom";
import {
  getMomentDate,
  getMomentTimeWithSeconds,
} from "../../../components/MomentFun";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import AccountsLoading from "./loaders/AccountsLoading";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import {
  formateAmount,
  isPremium,
  isTransactionAction,
} from "../../../helpers/commonFunctions";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import NoData from "../../../components/admin/NoData";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";

const Accounts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, accessLimit } = useSelector((store) => store.Account);
  const { user } = useSelector((store) => store.Auth);
  const { singleUserGroupData } = useSelector((store) => store.Group);
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [premiumModal, setPremiumModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [isAccountEdit, setIsAccountEdit] = useState({});
  const [openId, setOpenId] = useState("");
  const [dataArray, setDataArray] = useState([]);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const isActiveData = Object?.keys(singleUserGroupData)?.length ? true : false;
  const isAdmin = isActiveData
    ? user?._id == singleUserGroupData?.createBy?._id
    : true;

  const triggerDeleteRecord = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Account Delete",
    text: "Are you sure you want to delete this account? This change cannot be undone.",
    confirmButtonText: "Delete Account",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Account has been successfully deleted.",
  });

  const handleCloseSelectAccount = () => {
    setSelectedAccountType(""), setIsAccountEdit({});
  };

  const handleEditAccount = (data) => {
    if (data) {
      setOpenId("");
      setSelectedAccountType("addAccount");
      setIsAccountEdit(data);
    }
  };

  const handleDeleteRecord = async (id) => {
    // triggerDeleteRecord({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteAccountThunk(id));
    //     if (deleteAccountThunk.fulfilled.match(response)) {
    //       dispatch(getAccountThunk());
    //       return true;
    //     }
    //   },
    // });
    setIsDelete(true), setDeleteId(id);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false), setDeleteId(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteAccountThunk(deleteId));
    if (deleteAccountThunk.fulfilled.match(response)) {
      dispatch(getAccountThunk());
      return true;
    }
    return false;
  }, [dispatch, deleteId]);

  const handleModals = () => {
    if (
      isPremium() ||
      dataArray.length < accessLimit
    ) {
      if (!isActiveData) {
        setAccountTypeModel(true);
      }
    } else {
      setPremiumModal(true);
    }
  };

  const handleSearch = (searchValue) => {
    const searchedDataArray = data.filter((ele) => {
      return (
        ele.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        ele.accountType.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    setDataArray(searchedDataArray);
  };

  useEffect(() => {
    if (data.length === 0) {
      dispatch(getAccountThunk());
    }
  }, [dispatch]);

  useEffect(() => {
    setDataArray(data);
  }, [data]);

  return (
    <SettingLayout
      // onClick={handleModals}
      pageTitleData={{
        buttonContent: "Add Account",
        onButtonClick: handleModals,
        isButton: isAdmin,
      }}
    >
      {dataArray?.length || loading ? (
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
                  type
                </span>
              </th>
              <th
                className={`text-truncate border-bottom-0 text-capitalize p-3`}
              >
                <span
                  className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                >
                  last update
                </span>
              </th>
              <th
                className={`text-truncate border-bottom-0 text-capitalize p-3`}
              >
                <span
                  className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                >
                  balance
                </span>
              </th>
              <th
                className={`text-truncate border-bottom-0 text-capitalize p-3`}
              >
                <span
                  className={`fs-18 fw-normal text-table-head-color lh-base text-table-head-color`}
                >
                  Authority
                </span>
              </th>
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
              <AccountsLoading />
            ) : (
              //  : !dataArray?.length ? (
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
              dataArray.map((ele, index) => {
                const id = ele._id;
                const icon =
                  import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                  ele?.accountType?.icon;
                const title = ele?.title;
                const accountTypeTitle = ele?.accountType?.title;
                const symbol = ele?.currency?.symbol;
                const balance = ele?.balance;
                const updatedAt = ele?.updatedAt;
                const isPermission = isTransactionAction({ id });
                return (
                  <tr key={id}>
                    <td
                      onClick={() => {
                        dispatch(getAccountDetailsThunk(id));
                        navigate(ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE);
                      }}
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
                      onClick={() => {
                        dispatch(getAccountDetailsThunk(id));
                        navigate(ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE);
                      }}
                      className={`${
                        index % 2 == 0 ? "client-section-bg-color" : ""
                      } cursor-pointer max-w-300px border-0 p-3 responsive`}
                    >
                      <div className={`text-truncate`}>
                        <span
                          className={`fs-18 fw-normal lh-base mb-0 text-capitalize`}
                        >
                          {title}
                        </span>
                      </div>
                    </td>
                    <td
                      onClick={() => {
                        dispatch(getAccountDetailsThunk(id));
                        navigate(ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE);
                      }}
                      className={`${
                        index % 2 == 0 ? "client-section-bg-color" : ""
                      } cursor-pointer max-w-300px border-0 p-3 responsive`}
                    >
                      <div className={`text-truncate`}>
                        <span
                          className={`fs-18 fw-normal text-table-head-color lh-base mb-0`}
                        >
                          {accountTypeTitle}
                        </span>
                      </div>
                    </td>
                    <td
                      onClick={() => {
                        dispatch(getAccountDetailsThunk(id));
                        navigate(ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE);
                      }}
                      className={`${
                        index % 2 == 0 ? "client-section-bg-color" : ""
                      } text-truncate cursor-pointer border-0 p-3 responsive`}
                    >
                      <span
                        className={`fs-18 fw-normal text-table-text-color lh-base mb-0`}
                      >
                        {getMomentDate(updatedAt, "YYYY-MM-DD") +
                          " " +
                          getMomentTimeWithSeconds(updatedAt, "HH:MM:SS")}
                      </span>
                    </td>
                    <td
                      onClick={() => {
                        dispatch(getAccountDetailsThunk(id));
                        navigate(ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE);
                      }}
                      className={`${
                        index % 2 == 0 ? "client-section-bg-color" : ""
                      } cursor-pointer border-0 p-3 responsive`}
                    >
                      <div>
                        <span
                          className={`text-truncate fw-semibold fs-16 ${
                            balance > 0
                              ? "text-color-light-green"
                              : "text-color-invalid"
                          }`}
                        >
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
                    </td>
                    <td
                      className={`${
                        index % 2 == 0 ? "client-section-bg-color" : ""
                      } cursor-pointer border-0 p-3 text-center `}
                    >
                      {isPermission ? (
                        <ToggleMenu
                          rootClass={"tbody"}
                          onClose={() => setOpenId("")}
                          onClick={() => {
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
                              e.stopPropagation(), handleEditAccount(ele);
                            }}
                          >
                            Edit
                          </p>
                          <p
                            className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                            onClick={() => handleDeleteRecord(id)}
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
          title="No Accounts Found"
          description="You haven’t added any accounts yet. Link or create one to get started"
          buttonContent="Add Account"
          onButtonClick={handleModals}
        />
      )}
      <AccountTypeModel
        isOpen={accountTypeModel}
        onSelectValue={(enumValue) => setSelectedAccountType(enumValue)}
        onHide={() => setAccountTypeModel(false)}
      />
      <AddEditAccountModal
        isOpen={selectedAccountType == addAccount}
        onHide={handleCloseSelectAccount}
        item={isAccountEdit}
      />

      <PremiumModal
        isShow={premiumModal}
        onHide={() => setPremiumModal(false)}
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
    </SettingLayout>
  );
};

export default Accounts;
