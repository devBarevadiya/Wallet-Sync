import { Button, Form, Table } from "react-bootstrap";
import SettingLayout from "./Layout";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import { clearLocalData, logout } from "../../../helpers/commonFunctions";
import { useNavigate } from "react-router-dom";
import { OTHER_AUTH } from "../../../constants/routes";
import { useSelector } from "react-redux";
import { timePeriods } from "../../../helpers/enum";
import { setDefaultTimePeriod } from "../../../store/dashboard/slice";
import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { getCurrencyThunk } from "../../../store/currency/thunk";
import { changeBaseCurrencyThunk } from "../../../store/actions";
import ProfileModal from "../../../components/admin/modals/ProfileModal";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";

const General = () => {
  const { defaultTimePeriod } = useSelector((store) => store.Dashboard);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const { data, flatData } = useSelector((store) => store.Currency);
  const currency = baseCurrency?._id || baseCurrency?.currency;
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const nav = useNavigate();
  const dispatch = useDispatch();

  const triggerDeleteLocalData = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Delete All Local Data",
    text: "Are you sure you want to delete the Local data? This change cannot be undone.",
    confirmButtonText: "Delete Local Data",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",
    successText: "Local data has been successfully deleted.",
  });

  const handleDeleteUserData = () => {
    // triggerDeleteLocalData({
    //   dispatchFunction: async () => {
    //     clearLocalData();
    //     return true;
    //   },
    // });
    setIsDelete(true);
  };

  const handleDefaultDateFIlterValue = (value) => {
    localStorage.setItem("defaultTimePeriod", value);
    dispatch(setDefaultTimePeriod(value));
  };

  const handleChangeCurrency = async (value) => {
    await dispatch(changeBaseCurrencyThunk({ currency: value }));
  };

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  const handleConfirm = useCallback(() => {
    try {
      clearLocalData();
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!data?.length > 0) {
      dispatch(getCurrencyThunk());
    }
  }, []);

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
                  <h6 className="fw-medium fs-16">
                    Default interval on Dashboard
                  </h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    Let&apos;s start by selecting your base currency. The
                    selected currency will be applied to your default account
                    currency
                  </p>
                </td>
                <td className="py-3 border-bottom border-dark-white-color">
                  <Form.Group>
                    <Form.Select
                      value={defaultTimePeriod}
                      className="fs-14 fw-medium v-fit w-fit br-5 ms-auto"
                      onChange={(e) =>
                        handleDefaultDateFIlterValue(e.target.value)
                      }
                    >
                      <option value={timePeriods.THIS_MONTH}>This month</option>
                      <option value={timePeriods.THIS_YEAR}>This year</option>
                      <option value={timePeriods.LAST_MONTH}>Last month</option>
                      <option value={timePeriods.LAST_YEAR}>Last year</option>
                    </Form.Select>
                  </Form.Group>
                </td>
              </tr>
              <tr>
                <td className="py-3 border-bottom border-dark-white-color min-w-300px">
                  <h6 className="fw-medium fs-16">Change base currency</h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    Let&apos;s start by selecting your base currency all
                    transactions in other currencies will be calculated regards
                    this one.
                  </p>
                </td>
                <td className="py-3 border-bottom border-dark-white-color">
                  <Form.Group>
                    <Form.Select
                      value={currency}
                      className="fs-14 fw-medium v-fit w-fit br-5 ms-auto"
                      onChange={(e) => handleChangeCurrency(e.target.value)}
                    >
                      {flatData?.map((item, index) => {
                        return (
                          <option key={index} value={item?._id}>
                            {item?.code}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </td>
              </tr>
              <tr>
                <td className="py-3 border-bottom border-dark-white-color">
                  <h6 className="fw-medium fs-16">User profile</h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    Keep your profile fresh and personalized by updating your
                    profile picture and username.
                  </p>
                </td>
                <td className="py-3 border-bottom border-dark-white-color text-end">
                  <Button
                    className="bg-transparent text-dark common-border-color fs-14 fw-medium text-nowrap"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <i className="ri-user-3-line text-color-light-gray fw-medium fs-18 me-1"></i>{" "}
                    Edit Profile
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="py-3 border-bottom border-dark-white-color">
                  <h6 className="fw-medium fs-16">User password</h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    Manage and secure your account by setting a strong user
                    password.
                  </p>
                </td>
                <td className="py-3 border-bottom border-dark-white-color text-end">
                  <Button
                    className="bg-transparent text-dark common-border-color fs-14 fw-medium text-nowrap"
                    onClick={() => nav(OTHER_AUTH.CHANGE_PASSWORD)}
                  >
                    <i className="ri-lock-2-line text-color-light-gray fw-medium fs-18 me-1"></i>{" "}
                    Change Password
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="py-3 border-0">
                  <h6 className="fw-medium fs-16">Remove local data</h6>
                  <p className="p-0 m-0 fs-14 text-color-gray">
                    Delete locally stored data to enhance privacy and optimize
                    storage.
                  </p>
                </td>
                <td className="py-3 border-0 text-end">
                  <Button
                    className="bg-transparent text-dark common-border-color fs-14 fw-medium text-nowrap"
                    onClick={handleDeleteUserData}
                  >
                    <i className="ri-delete-bin-6-line text-color-light-gray fw-medium fs-18 me-1"></i>{" "}
                    Remove Local Data
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        <ProfileModal
          show={showProfileModal}
          onHide={() => setShowProfileModal(false)}
        />
      </SettingLayout>

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Local Data",
          description: "Are you sure you want to delete all Local Data?",
        }}
        onConfirm={handleConfirm}
        loading={false}
      />
    </>
  );
};

export default General;
