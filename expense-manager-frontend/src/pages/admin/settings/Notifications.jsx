import { Button, Form, Table } from "react-bootstrap";
import SettingLayout from "./Layout";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  getAccountThunk,
  getCategoryThunk,
  getLabelThunk,
  userNotificationThunk,
} from "../../../store/actions";
import NotificationLoading from "./loaders/NotificationLoading";
import { setNotificationStatus } from "../../../store/notification/slice";
import { authRoleEnum, notificationEnum } from "../../../helpers/enum";
import { setAllowedNotification } from "../../../store/auth/slice";
import { handleNumericInput } from "../../../helpers/commonFunctions";
import NotificationModal from "../../../components/admin/modals/NotificationModal";

const Notifications = () => {
  const { data: accountData, loading: accountLoading } = useSelector(
    (store) => store.Account
  );
  const { data: labelData, loading: labelLoading } = useSelector(
    (store) => store.Label
  );
  const { data: categoryData, loading: categoryLoading } = useSelector(
    (store) => store.Category
  );
  const { notificationStatus } = useSelector((store) => store.Notification);
  const { allowedNotifications, notificationLoading, user, baseCurrency } =
    useSelector((store) => store.Auth);

  const dispatch = useDispatch();
  const preNotificationState = useRef(allowedNotifications);
  const preThresholdAmount = allowedNotifications?.txnThresholdAmount || 0;
  const [allNotification, setAllNotification] = useState(false);
  const [thresholdAmount, setThresholdAmount] = useState();
  const [notificationModal, setNotificationModal] = useState(false);

  // ===============================================================
  //                aloowed notification states
  // ===============================================================

  const [allAllowedNotifications, setAllAllowedNotifications] = useState({
    allowedNotifications: [],
    txnThresholdAmount: 0,
    notifyOnTxnAccounts: [],
    notifyOnTxnLabels: [],
    notifyOnTxnHeadCategories: [],
  });

  const handleNotificationValues = (key) => {
    if (allAllowedNotifications.allowedNotifications?.includes(key)) {
      const filteredData = allAllowedNotifications.allowedNotifications?.filter(
        (item) => item !== key
      );
      setAllAllowedNotifications((pre) => ({
        ...pre,
        allowedNotifications: filteredData,
      }));
    } else {
      setAllAllowedNotifications((pre) => ({
        ...pre,
        allowedNotifications: [...pre.allowedNotifications, key],
      }));
    }
  };

  const handleOnlyIdBasedValueNotification = (stateKey, id) => {
    if (allAllowedNotifications[stateKey]?.includes(id)) {
      const filteredData = allAllowedNotifications[stateKey]?.filter(
        (item) => item !== id
      );
      setAllAllowedNotifications((pre) => ({
        ...pre,
        [stateKey]: filteredData,
      }));
    } else {
      setAllAllowedNotifications((pre) => ({
        ...pre,
        [stateKey]: [...pre[stateKey], id],
      }));
    }
  };

  const handleSubmit = async () => {
    const notificationToAdd = notificationEnum.TXN_THRESHOLD_EXCEED_REMINDER;
    const updatedNotifications = [
      ...allAllowedNotifications.allowedNotifications,
    ];

    if (!updatedNotifications.includes(notificationToAdd)) {
      updatedNotifications.push(notificationToAdd);
    }

    const response = await dispatch(
      userNotificationThunk({
        ...allAllowedNotifications,
        allowedNotifications: updatedNotifications,
        txnThresholdAmount:
          allAllowedNotifications.txnThresholdAmount >= 0
            ? allAllowedNotifications.txnThresholdAmount
            : 0,
      })
    );
    if (userNotificationThunk.fulfilled.match(response)) {
      dispatch(setAllowedNotification(allAllowedNotifications));
    }
  };

  const handleOpenModal = useCallback(() => setNotificationModal(true), []);
  const handleCloseModal = useCallback(() => setNotificationModal(false), []);

  const MemorizesFormCheck = memo((props) => {
    return <Form.Check {...props} />;
  }, []);
  MemorizesFormCheck.displayName = "MemorizesFormCheck";

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      if (
        Notification.permission == "granted" ||
        notificationStatus == "granted"
      ) {
        setAllNotification(true);
      } else {
        setAllNotification(false);
      }
      dispatch(setNotificationStatus(Notification.permission));
    }
  }, [dispatch, notificationStatus]);

  const requestGeolocation = () => {
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          dispatch(setNotificationStatus(permission));
          if (permission === "granted") {
            setAllNotification(true);
            // Example: show a welcome notification
            // new Notification("Notifications enabled!", {
            //   body: "You will receive updates from us.",
            // });
          } else {
            dispatch(setNotificationStatus(permission));
            setAllNotification(false);
          }
        });
      }
    } else {
      alert("Notifications are not supported on this device.");
    }
  };

  useEffect(() => {
    if (!accountData?.length) {
      dispatch(getAccountThunk());
    }
    if (!labelData?.length) {
      dispatch(getLabelThunk());
    }
    if (!categoryData?.length) {
      dispatch(getCategoryThunk());
    }
    // setAllAllowedNotifications((pre) => ({ ...pre, ...allowedNotifications }));
  }, []);

  useEffect(() => {
    setAllAllowedNotifications(allowedNotifications);
    preNotificationState.current = allowedNotifications;
  }, [allowedNotifications]);

  useEffect(() => {
    setThresholdAmount(preThresholdAmount);
  }, [allowedNotifications]);

  return (
    <>
      <SettingLayout
        pageTitleData={{
          isButton: false,
        }}
        layoutHeight="settings-layout-big"
        className="pt-2 pt-sm-3"
        onClick={user?.role == authRoleEnum.ADMIN ? handleOpenModal : undefined}
        buttonContent="Create Notification"
      >
        {!accountLoading || !labelLoading || !categoryLoading ? (
          <div className="p-4 pb-0 responsive">
            {/* <span className="text-color-invalid fs-14 d-block text-end mb-3">
              Notifications are enabled. To turn them off, please manage
              settings in your browser.
            </span> */}
            <label className="d-flex justify-content-between cursor-pointer">
              <span>
                <h6 className="fs-16 fw-medium mb-1">Push Notifications</h6>
                <span className="text-color-gray fs-14">
                  Set a schedule to run off push notifications
                </span>
              </span>

              <Form>
                <span
                  onClick={() => {
                    if (notificationStatus == "granted") {
                      alert(
                        "Notifications are enabled. To turn them off, please manage settings in your browser."
                      );
                    } else if (notificationStatus == "denied") {
                      alert(
                        "Notifications are disabled. To turn them on, please manage settings in your browser."
                      );
                    }
                  }}
                >
                  <MemorizesFormCheck
                    disabled={allNotification}
                    checked={allNotification}
                    onChange={() => requestGeolocation()}
                    className="switch lg me-1"
                    type="switch"
                    id="push-notification"
                  />
                </span>
              </Form>
            </label>

            {allNotification && (
              <div className="w-100 mt-3 mt-xl-0">
                <Table responsive className="align-">
                  <thead>
                    <tr>
                      <th className="border-0"></th>
                      <th className="text-end text-md-center fs-16 fw-medium border-0 w-150px p-0">
                        Push Notification
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* <tr className="">
                      <td className="px-0 border-dark-white-color py-2">
                        <h6 className="fs-16 fw-medium mb-1">
                          Budget reminder
                        </h6>
                        <span className="text-color-gray fs-14">
                          Set a schedule to run off push notifications
                        </span>
                      </td>
                      <td className="text-end text-md-center border-dark-white-color py-3">
                        <Form.Check
                          className="square-check lg text-color-light-gray fs-15 mt-2 me-1"
                          type={"checkbox"}
                          id={`all-account`}
                        />
                      </td>
                    </tr> */}
                    <tr>
                      <td
                        onClick={() =>
                          handleNotificationValues(
                            notificationEnum.RECURRING_BILL_REMINDER
                          )
                        }
                        className="px-0 border-dark-white-color py-3 cursor-pointer user-select-none"
                      >
                        <h6 className="fs-16 fw-medium mb-1">
                          Recurring bill reminder
                        </h6>
                        <span className="text-color-gray fs-14">
                          Set a schedule to run off push notifications
                        </span>
                      </td>
                      <td className="text-end text-md-center border-dark-white-color py-3">
                        <MemorizesFormCheck
                          checked={allAllowedNotifications.allowedNotifications?.includes(
                            notificationEnum.RECURRING_BILL_REMINDER
                          )}
                          className="square-check lg text-color-light-gray fs-15 mt-2 me-1"
                          type={"checkbox"}
                          id={`bill-remainder`}
                          onChange={() =>
                            handleNotificationValues(
                              notificationEnum.RECURRING_BILL_REMINDER
                            )
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-0 border-dark-white-color py-3">
                        <h6 className="fs-16 fw-medium mb-1">
                          Threshold exceeded reminder
                        </h6>
                        <span className="text-color-gray fs-14">
                          Upcoming recurring payment reminder{" "}
                          {baseCurrency?.symbol || "$"}
                          <input
                            value={thresholdAmount}
                            placeholder="-"
                            type="number"
                            min={0}
                            className="border-color-primary border text-center ms-2 rounded-2 px-1 h-25px"
                            style={{
                              minWidth: "20px",
                              width: `${
                                20 + thresholdAmount?.toString()?.length * 10
                              }px`,
                            }}
                            onInput={handleNumericInput}
                            // onChange={(e) =>
                            //   (e.target.style.width = `${
                            //     20 + e.target.value.length * 10
                            //   }px`)
                            // }
                            onChange={(e) => {
                              setThresholdAmount(e.target.value),
                                setAllAllowedNotifications((pre) => ({
                                  ...pre,
                                  txnThresholdAmount: Number(e.target.value),
                                }));
                            }}
                          />
                        </span>
                        {/* <div className="mt-3 d-flex gap-2">
                          <Button
                            className="primary-btn fs-14 v-fit py-2 br-10"
                            disabled={false}
                          >
                            Save
                          </Button>

                          <Button
                            className="primary-btn light-gray-btn fs-14 v-fit py-2 br-10"
                            disabled={false}
                          >
                            Cancel
                          </Button>
                        </div> */}
                      </td>
                      <td className="text-end text-md-center border-dark-white-color py-3">
                        {/* <Form.Check
                          checked={allAllowedNotifications.allowedNotifications?.includes(
                            notificationEnum.TXN_THRESHOLD_EXCEED_REMINDER
                          )}
                          className="square-check lg text-color-light-gray fs-15 mt-2 me-1"
                          type={"checkbox"}
                          id={`payment-remainder`}
                          onChange={() =>
                            handleNotificationValues(
                              notificationEnum.TXN_THRESHOLD_EXCEED_REMINDER
                            )
                          }
                        /> */}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <div>
                  <div>
                    {/* ===================================================
                                      Group Activity Reminder
                  ====================================================== */}

                    <label
                      className={`d-flex user-select-none cursor-pointer justify-content-between border-bottom border-dark-white-color pb-3 mb-3`}
                    >
                      <span>
                        <h6 className="fs-16 fw-medium mb-1">
                          Group activity remainder
                        </h6>
                        <span className="text-color-gray fs-14">
                          Set a schedule to run off push notifications
                        </span>
                      </span>
                      <Form>
                        <Form.Check
                          checked={allAllowedNotifications.allowedNotifications?.includes(
                            notificationEnum.BUDGET_REMINDER
                          )}
                          onChange={() => {
                            // accountReminder
                            //   ? setAccoutRemainder(false)
                            //   : setAccoutRemainder(true);
                            handleNotificationValues(
                              notificationEnum.BUDGET_REMINDER
                            );
                          }}
                          className="switch lg me-1"
                          type="switch"
                          id="account-remainder"
                        />
                      </Form>
                    </label>

                    {/* ===================================================
                                      Account Reminder
                  ====================================================== */}

                    <label
                      className={`d-flex cursor-pointer user-select-none justify-content-between ${
                        allAllowedNotifications.allowedNotifications?.includes(
                          notificationEnum.TXN_ACCOUNT_REMINDER
                        )
                          ? ""
                          : "border-bottom"
                      } border-dark-white-color pb-3`}
                    >
                      <span>
                        <h6 className="fs-16 fw-medium mb-1">
                          Account reminder
                        </h6>
                        <span className="text-color-gray fs-14">
                          Set a schedule to run off push notifications
                        </span>
                      </span>
                      <Form>
                        <Form.Check
                          checked={allAllowedNotifications.allowedNotifications?.includes(
                            notificationEnum.TXN_ACCOUNT_REMINDER
                          )}
                          onChange={() => {
                            // accountReminder
                            //   ? setAccoutRemainder(false)
                            //   : setAccoutRemainder(true);
                            handleNotificationValues(
                              notificationEnum.TXN_ACCOUNT_REMINDER
                            );
                          }}
                          className="switch lg me-1"
                          type="switch"
                          id="account-remainder"
                        />
                      </Form>
                    </label>
                    {allAllowedNotifications.allowedNotifications?.includes(
                      notificationEnum.TXN_ACCOUNT_REMINDER
                    ) &&
                      (accountData?.length > 0 ? (
                        <Table responsive className="">
                          <thead>
                            <tr>
                              <th className={"border-0 p-0"}></th>
                              <th className="text-end text-md-center fs-16 fw-medium border-0 w-150px p-0">
                                Push Notification
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {accountData?.map((item, index) => {
                              const title = item?.title;
                              const id = item?._id;
                              return (
                                <tr
                                  onClick={() =>
                                    handleOnlyIdBasedValueNotification(
                                      "notifyOnTxnAccounts",
                                      id
                                    )
                                  }
                                  className="cursor-pointer user-select-none"
                                  key={index}
                                >
                                  <td className="px-0 border-dark-white-color py-3">
                                    <h6 className="fs-16 fw-medium max-w-300px text-truncate p-0 m-0 text-capitalize">
                                      {title}
                                    </h6>
                                  </td>
                                  <td className="text-end text-md-center border-dark-white-color py-3">
                                    <MemorizesFormCheck
                                      checked={allAllowedNotifications.notifyOnTxnAccounts?.includes(
                                        id
                                      )}
                                      className="square-check lg text-color-light-gray fs-15 me-1"
                                      type={"checkbox"}
                                      id={`accounts-${index}`}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      ) : (
                        <span className="d-block text-center client-section-bg-color py-2 rounded-3 text-color-gray fs-16">
                          No Accounts Yet
                        </span>
                      ))}
                  </div>

                  {/* ====================================================
                                       Label reminder
                  ======================================================== */}

                  <div>
                    <label
                      className={`d-flex cursor-pointer justify-content-between ${
                        allAllowedNotifications.allowedNotifications?.includes(
                          notificationEnum.TXN_LABEL_REMINDER
                        )
                          ? ""
                          : "border-bottom"
                      } border-dark-white-color py-3`}
                    >
                      <span>
                        <h6 className="fs-16 fw-medium mb-1">Label reminder</h6>
                        <span className="text-color-gray fs-14">
                          Set a schedule to run off push notifications
                        </span>
                      </span>
                      <Form>
                        <Form.Check
                          checked={allAllowedNotifications.allowedNotifications?.includes(
                            notificationEnum.TXN_LABEL_REMINDER
                          )}
                          onChange={() => {
                            // labelReminder
                            //   ? setLabelRemainder(false)
                            //   : setLabelRemainder(true);
                            handleNotificationValues(
                              notificationEnum.TXN_LABEL_REMINDER
                            );
                          }}
                          className="switch lg me-1"
                          type="switch"
                          id="label-remainder"
                        />
                      </Form>
                    </label>
                    {allAllowedNotifications.allowedNotifications?.includes(
                      notificationEnum.TXN_LABEL_REMINDER
                    ) &&
                      (labelData?.length > 0 ? (
                        <Table responsive className="">
                          <thead>
                            <tr>
                              <th className="border-0 p-0"></th>
                              <th className="text-end text-md-center fs-16 fw-medium border-0 w-150px p-0">
                                Push Notification
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {labelData?.map((item, index) => {
                              const title = item?.title;
                              const id = item?._id;
                              return (
                                <tr
                                  className="cursor-pointer user-select-none"
                                  key={index}
                                  onClick={() =>
                                    handleOnlyIdBasedValueNotification(
                                      "notifyOnTxnLabels",
                                      id
                                    )
                                  }
                                >
                                  <td className="px-0 border-dark-white-color py-3">
                                    <h6 className="fs-16 fw-medium m-0 p-0 max-w-300px text-truncate text-capitalize">
                                      {title}
                                    </h6>
                                  </td>
                                  <td className="text-end text-md-center border-dark-white-color py-3">
                                    <MemorizesFormCheck
                                      checked={allAllowedNotifications.notifyOnTxnLabels?.includes(
                                        id
                                      )}
                                      className="square-check lg text-color-light-gray fs-15 me-1"
                                      type={"checkbox"}
                                      id={`label-${index}`}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      ) : (
                        <span className="d-block text-center client-section-bg-color py-2 rounded-3 text-color-gray fs-16">
                          No Labels Yet
                        </span>
                      ))}
                  </div>

                  {/* ====================================================
                                      Category reminder
                  ======================================================== */}

                  <div>
                    <label
                      className={`d-flex cursor-pointer user-select-none justify-content-between ${
                        allAllowedNotifications.allowedNotifications?.includes(
                          notificationEnum.TXN_HEAD_CATEGORY_REMINDER
                        )
                          ? ""
                          : "border-bottom"
                      } border-dark-white-color py-3 align-items-center`}
                    >
                      <span>
                        <h6 className="fs-16 fw-medium mb-1">
                          Category reminder
                        </h6>
                        <span className="text-color-gray fs-14">
                          Set a schedule to run off push notifications
                        </span>
                      </span>
                      <Form>
                        <Form.Check
                          checked={allAllowedNotifications.allowedNotifications?.includes(
                            notificationEnum.TXN_HEAD_CATEGORY_REMINDER
                          )}
                          onChange={() => {
                            // categoryReminder
                            //   ? setCategoryRemainder(false)
                            //   : setCategoryRemainder(true);
                            handleNotificationValues(
                              notificationEnum.TXN_HEAD_CATEGORY_REMINDER
                            );
                          }}
                          className="switch lg me-1"
                          type="switch"
                          id="category-remainder"
                        />
                      </Form>
                    </label>
                    {allAllowedNotifications.allowedNotifications?.includes(
                      notificationEnum.TXN_HEAD_CATEGORY_REMINDER
                    ) &&
                      (categoryData?.length > 0 ? (
                        <Table responsive className="mb-0 align-middle">
                          <tbody>
                            {categoryData?.map((item, index) => {
                              const title = item?.title;
                              const id = item?._id;
                              const isIncludes =
                                allAllowedNotifications.notifyOnTxnHeadCategories?.includes(
                                  id
                                );

                              return (
                                <>
                                  <tr
                                    className="cursor-pointer use-select-none"
                                    key={index}
                                    onClick={() =>
                                      handleOnlyIdBasedValueNotification(
                                        "notifyOnTxnHeadCategories",
                                        id
                                      )
                                    }
                                  >
                                    <td
                                      className={`px-0 border-dark-white-color py-3`}
                                    >
                                      <h6
                                        className={`fs-16 fw-medium max-w-300px text-truncate p-0 m-0 text-capitalize `}
                                      >
                                        {title}
                                      </h6>
                                    </td>
                                    <td
                                      className={`text-end border-dark-white-color py-3 px-0 `}
                                    >
                                      {/* <MemorizesFormCheck
                                        checked={isIncludes}
                                        onChange={() =>
                                          isIncludes
                                            ? handleRemoveCategory(
                                                categoryIncludedIdInNotification,
                                                id
                                              )
                                            : handleSelectHeadCategory(id)
                                        }
                                        className="switch lg me-1"
                                        type="switch"
                                        id={`head-category-${index}`}
                                      /> */}
                                      <MemorizesFormCheck
                                        checked={isIncludes}
                                        className="square-check lg text-color-light-gray fs-15 me-1"
                                        type={"checkbox"}
                                        id={`head-category-${index}`}
                                      />
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </tbody>
                        </Table>
                      ) : (
                        <span className="d-block text-center client-section-bg-color py-2 rounded-3 text-color-gray fs-16">
                          No Head Category Yet
                        </span>
                      ))}
                  </div>
                </div>

                <span className="d-flex gap-2 justify-content-end position-sticky bottom-0 py-3 bg-white">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      notificationLoading ||
                      (preNotificationState?.current ==
                        allAllowedNotifications &&
                        preThresholdAmount == thresholdAmount)
                    }
                    className="primary-btn fs-14 v-fit py-2 br-10"
                  >
                    {notificationLoading ? "Loading..." : "Save"}
                  </Button>
                  <Button
                    onClick={() =>
                      setAllAllowedNotifications(allowedNotifications)
                    }
                    className="primary-btn light-gray-btn fs-14 v-fit py-2 br-10"
                  >
                    Cancel
                  </Button>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <NotificationLoading />
          </div>
        )}
      </SettingLayout>

      <NotificationModal
        isOpen={notificationModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Notifications;
