import { Button, Table } from "react-bootstrap";
import SettingLayout from "./Layout";
import { useDispatch } from "react-redux";
import {
  deleteTransactionsAppSettingsThunk,
  deleteTransactionsThunk,
  deleteUserDataThunk,
  userLogoutThunk,
} from "../../../store/actions";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import { useNavigate } from "react-router-dom";
import { ADMIN, CLIENT } from "../../../constants/routes";
import { clearToken } from "../../../store/auth/slice";
import { useCallback, useState } from "react";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import { useSelector } from "react-redux";
import { resetGroup } from "../../../store/group/slice";
import { resetLabel } from "../../../store/label/slice";
import { resetPayee } from "../../../store/payee/slice";
import { resetCategory } from "../../../store/category/slice";

const DataNPrivacy = () => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [modalType, setModalType] = useState("");
  const { dataLoading } = useSelector((store) => store.Auth);

  //   trigger confirmation alert

  const triggerDeleteUserData = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Delete All User Data",
    text: "Are you sure you want to delete the all User data? This change cannot be undone.",
    confirmButtonText: "Delete User Data",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "User data has been successfully deleted.",
  });

  const triggerDeleteTransactions = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Delete All Transactions",
    text: "Are you sure you want to delete the all Transactions? This change cannot be undone.",
    confirmButtonText: "Delete All Transactions",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "All Transactions has been successfully deleted.",
  });

  const triggerDeleteTransactionNAppSettings = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Delete All Transactions & settings",
    text: "Are you sure you want to delete the all Transactions & settings? This change cannot be undone.",
    confirmButtonText: "Delete All Transactions & settings",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "All Transactions & settings has been successfully deleted.",
  });

  //   delete function handler

  const handleDeleteUserData = useCallback(async () => {
    const deviceToken = localStorage.getItem("deviceToken") || "";
    if (deviceToken) {
      const logoutResponse = await dispatch(userLogoutThunk({ deviceToken }));
      if (userLogoutThunk.fulfilled.match(logoutResponse)) {
        const response = await dispatch(deleteUserDataThunk());
        if (deleteUserDataThunk.fulfilled.match(response)) {
          nav(CLIENT.HOME);
          localStorage.clear();
          dispatch({ type: "RESET_STORE" });
          dispatch(clearToken());
          return true;
        }
        return false;
      }
      return false;
    } else {
      const response = await dispatch(deleteUserDataThunk());
      if (deleteUserDataThunk.fulfilled.match(response)) {
        nav(CLIENT.HOME);
        localStorage.clear();
        dispatch({ type: "RESET_STORE" });
        dispatch(clearToken());
        return true;
      }
      return false;
    }
    // const response = await dispatch(deleteUserDataThunk());
    // if (deleteUserDataThunk?.fulfilled?.match(response)) {
    //   logout();
    //   return true;
    // }
    // return false;
  }, [dispatch, nav]);

  const deleteTransactionsNSettings = useCallback(async () => {
    const response = await dispatch(deleteTransactionsAppSettingsThunk());
    if (deleteTransactionsAppSettingsThunk?.fulfilled?.match(response)) {
      dispatch(resetGroup());
      dispatch(resetPayee());
      dispatch(resetLabel());
      dispatch(resetCategory());
      nav(ADMIN.DASHBOARD.PATH);
      return true;
    }
    return false;
  }, [dispatch]);

  const deleteTransactions = useCallback(async () => {
    const response = await dispatch(deleteTransactionsThunk());
    if (deleteTransactionsThunk?.fulfilled?.match(response)) {
      nav(ADMIN.DASHBOARD.PATH);
      return true;
    }
    return false;
  }, [dispatch]);

  const handleOpenModal = useCallback((type) => setModalType(type), []);

  const handleCloseModal = useCallback(() => setModalType(""), []);

  return (
    <>
      <SettingLayout
        pageTitleData={{
          isButton: false,
        }}
        layoutHeight="settings-layout-big"
        className="pt-2 pt-sm-3"
      >
        <div className="px-3">
          <Table responsive className="align-middle responsive">
            <tbody>
              <tr>
                <td className="py-3 border-bottom border-dark-white-color min-w-300px">
                  <h6 className="fw-medium fs-16">Documents to review</h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    Set your default interval for the Dashboard to customize
                    your financial overview.
                  </p>
                </td>
                <td className="py-3 border-bottom border-dark-white-color">
                  <div className="d-flex gap-3 justify-content-end">
                    <a
                      target="_blank"
                      href={`${import.meta.env.VITE_LIVE_WEB_URL}/privacy-policy`}
                    >
                      <Button className="bg-transparent text-dark common-border-color fs-14 fw-medium text-nowrap">
                        <i className="ri-shield-check-line text-color-light-gray fw-medium fs-18 me-1"></i>{" "}
                        Privacy Policy
                      </Button>
                    </a>
                    <a
                      target="_blank"
                      href={`${import.meta.env.VITE_LIVE_WEB_URL}/terms-conditions`}
                    >
                      <Button className="bg-transparent text-dark common-border-color fs-14 fw-medium text-nowrap">
                        <i className="ri-file-list-3-line text-color-light-gray fw-medium fs-18 me-1"></i>{" "}
                        Terms of Service
                      </Button>
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="py-3 border-bottom border-dark-white-color"
                >
                  <h6 className="fw-medium fs-16">Data portability</h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    You have right to change your personal data by editing your
                    profile information, change your transaction data for cash
                    accounts by editing them. You can delete your transactions
                    from linked accounts by deleting the whole set of
                    transactions - this data is not editable. <br /> <br />
                    You have right to be informed about the data we hold about
                    you and you can transfer your data and you have right to be
                    forgotten and delete all your data - all of which you can do
                    by sending us an email to support@walletsync.app. <br />{" "}
                    <br /> In case you have any specific issues or request,
                    please contact our Data Protection Officer on email:
                    support@walletsync.app.
                    {/* dpo@walletSyncexpensetracker.com. */}
                  </p>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="py-3 border-0">
                  <div className="d-flex gap-3 flex-wrap">
                    <Button
                      className="bg-color-invalid-10 text-dark border-color-invalid fs-14 fw-medium text-nowrap"
                      onClick={() => handleOpenModal("deleteTransactions")}
                    >
                      <i className="ri-delete-bin-line text-color-invalid fw-medium fs-18 me-1"></i>{" "}
                      Delete all transactions
                    </Button>
                    <Button
                      className="bg-color-invalid-10 text-dark border-color-invalid fs-14 fw-medium text-nowrap"
                      onClick={() =>
                        handleOpenModal("deleteTransactionsNSettings")
                      }
                    >
                      <i className="ri-delete-bin-line text-color-invalid fw-medium fs-18 me-1"></i>{" "}
                      Delete transactions and all settings
                    </Button>
                    <Button
                      className="bg-color-invalid-10 text-dark border-color-invalid fs-14 fw-medium text-nowrap"
                      onClick={() => handleOpenModal("handleDeleteUserData")}
                    >
                      <i className="ri-delete-bin-line text-color-invalid fw-medium fs-18 me-1"></i>{" "}
                      Delete profile and all user data
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </SettingLayout>

      <CommonDeleteModal
        isOpen={modalType == "deleteTransactions"}
        onClose={handleCloseModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete All Transactions",
          description: "Are you sure you want to delete all Transactions?",
        }}
        onConfirm={deleteTransactions}
        loading={dataLoading}
      />

      <CommonDeleteModal
        isOpen={modalType == "deleteTransactionsNSettings"}
        onClose={handleCloseModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete All Transactions and Settings",
          description:
            "Are you sure you want to delete all Transactions and Settings?",
        }}
        onConfirm={deleteTransactionsNSettings}
        loading={dataLoading}
      />

      <CommonDeleteModal
        isOpen={modalType == "handleDeleteUserData"}
        onClose={handleCloseModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete User",
          // description: "Are you sure you want to delete User?",
          customDescription:
            "Are you sure you want to delete this user? <br/> <strong> Once deleted, the subscription cannot be recovered. </strong>",
        }}
        onConfirm={handleDeleteUserData}
        loading={dataLoading}
      />
    </>
  );
};

export default DataNPrivacy;
