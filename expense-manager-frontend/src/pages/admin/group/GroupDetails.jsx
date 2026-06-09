import { useNavigate, useParams } from "react-router-dom";
import SettingLayout from "../settings/Layout";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addMemberThunk,
  changePermissionThunk,
  deleteGroupThunk,
  getGroupDetailsThunk,
  removeMemberThunk,
} from "../../../store/group/thunk";
import { Image } from "../../../data/images";
import { Button, Form, Modal, Table } from "react-bootstrap";
import ModelWrapper from "../../../components/ModelWrapper";
import * as yup from "yup";
import { useFormik } from "formik";
import InputField from "../../../components/inputFields/InputField";
import { getAccountThunk } from "../../../store/actions";
import {
  addAccount,
  groupAccessEnum,
  subscriptionTypeEnum,
} from "../../../helpers/enum";
import GroupModal from "../settings/modals/GroupModal";
import { ADMIN } from "../../../constants/routes";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import TableTitle from "../../../components/admin/pageTitle/TableTitle";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import AlertModal from "../../../components/admin/modals/AlertModal";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import { isPremium } from "../../../helpers/commonFunctions";
import { useModalScroll } from "../../../helpers/customHooks";

const GroupDetails = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { singleData, singleLoading, actionLoading } = useSelector(
    (store) => store.Group
  );
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const { data } = useSelector((store) => store.Account);
  const { user } = useSelector((store) => store.Auth);
  const [isOpen, setIsOpen] = useState(false);
  const [openId, setOpenId] = useState("");
  const [editData, setEditData] = useState({});
  const [removeMemberId, setRemoveMemberId] = useState(null);
  const [isEditPermission, setIsEditPermission] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [premiumModel, setPremiumModel] = useState("");
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isRemoveMember, setIsRemoveMember] = useState(false);
  const members =
    singleData?.members?.filter(
      (item) => item?.user && user?._id !== item?.user?._id
    ) || [];
  const isAdmin = user?._id == singleData?.createBy?._id;
  const dispatch = useDispatch();

  const icon = singleData?.icon
    ? import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + singleData?.icon
    : Image.groupSharingImg;

  const accountData =
    data?.map((item) => {
      return { account: item?._id, permission: "NO_ACCESS" };
    }) || [];

  const initialValues = {
    email: "",
    accounts: accountData,
  };

  const validationSchema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
    accounts: yup
      .array()
      .of(
        yup.object().shape({
          account: yup.string().required("Account ID is required"),
          permission: yup
            .string()
            .oneOf(
              [
                groupAccessEnum.ADMIN_ACCESS,
                groupAccessEnum.NO_ACCESS,
                groupAccessEnum.READONLY,
                groupAccessEnum.TRACK_AND_READ,
              ],
              "Invalid permission"
            )
            .required("Permission is required"),
        })
      )
      .required("Accounts are required"),
  });

  const validation = useFormik({
    name: "groupValidation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (isEditPermission) {
        const response = await dispatch(
          changePermissionThunk({
            groupId: id,
            values,
          })
        );
        if (changePermissionThunk.fulfilled.match(response)) {
          setIsOpen(false);
          resetForm();
        }
      } else {
        const response = await dispatch(addMemberThunk({ id, values }));
        if (addMemberThunk.fulfilled.match(response)) {
          setIsOpen(false);
          await dispatch(getGroupDetailsThunk(id));
          resetForm();
        }
      }
    },
  });

  const triggerRemoveMember = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Remove member",
    text: "Are you sure you want to remove this member?",
    confirmButtonText: "Remove Member",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "member removed successfully!",
  });

  const triggerDeleteGroup = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Delete this Group",
    text: "Are you sure you want to Delete this Group?",
    confirmButtonText: "Delete Group",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Group Deleted successfully!",
  });

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

  const removeMember = (userId) => {
    // triggerRemoveMember({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(
    //       removeMemberThunk({ groupId: id, id: userId })
    //     );
    //     if (removeMemberThunk.fulfilled.match(response)) {
    //       return true;
    //     }
    //     return false;
    //   },
    // });
    setRemoveMemberId(userId);
    setIsRemoveMember(true);
  };

  const handleEdit = (values) => {
    if (!data?.length > 0) {
      handleOpenAlert();
    } else {
      const email = values?.user?.email || "";
      const account = values?.accounts?.map((item) => {
        return { account: item?.account?._id, permission: item?.permission };
      });
      validation.setFieldValue("email", email);
      values?.accounts?.length && validation.setFieldValue("accounts", account);
      setIsEditPermission(true);
      setIsOpen(true);
    }
  };

  const handleDeleteGroup = () => {
    // triggerDeleteGroup({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteGroupThunk(id));
    //     if (deleteGroupThunk.fulfilled.match(response)) {
    //       nav(ADMIN.GROUP_SHARING.PATH);
    //       return true;
    //     }
    //     return false;
    //   },
    // });
    setIsDelete(true);
  };

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteGroupThunk(id));
    if (deleteGroupThunk.fulfilled.match(response)) {
      nav(ADMIN.GROUP_SHARING.PATH);
      return true;
    }
    return false;
  }, [dispatch, id, nav]);

  const handleConfirmRemoveMember = useCallback(async () => {
    const response = await dispatch(
      removeMemberThunk({ groupId: id, id: removeMemberId })
    );
    if (removeMemberThunk.fulfilled.match(response)) {
      return true;
    }
    return false;
  }, [id, dispatch, removeMemberId]);

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);
  const handleCloseMemberModal = useCallback(() => {
    setIsRemoveMember(false), setRemoveMemberId(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    if (isPremium()) {
      setIsOpen(true);
    } else {
      setPremiumModel(true);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      if (id) {
        const response = await dispatch(getGroupDetailsThunk(id));
        if (getGroupDetailsThunk.fulfilled.match(response)) {
          if (response.payload.data?.createBy?._id !== user._id) {
            nav(ADMIN.GROUP_SHARING.PATH);
          }
        }
      }
    })();
    if (!data?.length) {
      dispatch(getAccountThunk());
    }
  }, [data?.length, id, nav, dispatch, user?._id]);

  return (
    <>
      <div className="pt-4 mb-3">
        <PageTitle
          // filterButton={true}
          // setCanvas={() => setCanvas(true)}
          title="Group Sharing"
          subTitle="Explain the steps for setting up a new group"
          onButtonClick={handleOpenModal}
          buttonContent="Add Member"
          isAccountRequired
          isButton={isAdmin}
          // onSuccess={getTransactionPara}
        />

        <TableTitle
          // count={data?.length}
          title="Group Members"
          // buttonContent="Add Payee"
          // onClick={() => setIsModal(true)}
        />
        <div className="bg-white rounded-bottom-4 border common-border-color border-top-0">
          {/* <SettingLayout> */}
          <div
            className="p-3 responsive"
            // style={{ minHeight: `calc(100% - (63px + 50px))` }}
            style={{ minHeight: `calc(100vh - (80px + 218px))` }}
          >
            <span>
              <i
                className="ri-delete-bin-line text-end d-block text-color-invalid fs-21 cursor-pointer"
                onClick={handleDeleteGroup}
              ></i>
            </span>
            <div
              className={`text-center ${
                singleLoading ? " opacity-loading" : ""
              }`}
            >
              <div className="position-relative d-inline-block">
                <img
                  src={icon}
                  className="wh-80px border border-3 border-color-light-primary br-18 mx-auto d-block object-fit-cover"
                  alt=""
                />
                {/* <label
                htmlFor="group-img"
                className="d-block h-30px w-30px d-flex align-items-center justify-content-center rounded-circle bg-color-primary position-absolute bottom-0 end-0 border-2 border common-border-color"
              >
                <i className="ri-edit-line text-white fs-14 cursor-pointer text-color-white"></i>
              </label> */}
                {/* <input
                type="file"
                id="group-img"
                className="d-none"
                onChange={handleEditIcon}
              /> */}
              </div>
              <h5 className="mt-2 fs-20 text-capitalize m-0 text-wrap mx-auto d-flex align-items-center justify-content-center">
                <span className="text-break max-w-300px truncate-line-1">
                  {singleData?.title}
                </span>
                <span>
                  <i
                    className="ri-edit-line ms-2 text-color-light-gray cursor-pointer"
                    onClick={() => {
                      setEditData(singleData);
                    }}
                  ></i>
                </span>
              </h5>
              <span className="text-color-light-gray fs-14">
                {members?.length} People
              </span>
            </div>
            <div>
              {!singleLoading ? (
                <Table responsive className="align-middle">
                  <thead>
                    <tr>
                      <th className="text-color-light-gray fs-16">
                        Group members
                      </th>
                      <th className="text-color-light-gray fs-16 text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members?.map((item, index) => {
                      const userName =
                        item?.user?.username || item?.user?.email;
                      const userId = item?.user?._id;
                      const isActive = item?.isActive;
                      const createdBy = singleData?.createBy?._id;
                      return (
                        <tr key={index}>
                          <td
                            className={`py-4 ${
                              members?.length == index + 1 ? "border-0" : ""
                            }`}
                          >
                            <div
                              className="d-flex align-items-center gap-2 cursor-pointer"
                              onClick={() => handleEdit(item)}
                            >
                              <div className="position-relative">
                                <img
                                  src={Image.groupSharingImg}
                                  className="h-50px w-50px border border-2 border-color-light-primary bg-color-primary-10 br-12"
                                  alt=""
                                />
                                {isActive && (
                                  <span className="bg-color-light-green active-dot position-absolute rounded-circle"></span>
                                )}
                              </div>
                              <div className="">
                                <h6 className="fs-15 m-0 text-truncate max-w-300px pe-5">
                                  {userName}
                                </h6>
                                <span className="fs-12 text-color-light-gray max-w-300px text-truncate d-block">
                                  {userId == createdBy ? (
                                    <span className="fs-12 me-2 text-color-light-green">
                                      Admin:
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                  {singleData?.title}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`py-4 ${
                              members?.length == index + 1 ? "border-0" : ""
                            }`}
                          >
                            <div className="text-end">
                              <ToggleMenu
                                rootClass={"table"}
                                onClose={() => setOpenId("")}
                                onClick={() => {
                                  if (openId == index + 1) {
                                    setOpenId("");
                                  } else {
                                    setOpenId(index + 1);
                                  }
                                }}
                                isOpen={openId == index + 1}
                              >
                                <p
                                  className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg text-nowrap"
                                  onClick={(e) => {
                                    e.stopPropagation(),
                                      !data?.length > 0
                                        ? handleOpenAlert()
                                        : handleEdit(item);
                                  }}
                                >
                                  Edit Permissions
                                </p>
                                <p
                                  className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg text-nowrap"
                                  onClick={() => removeMember(userId)}
                                >
                                  Remove member
                                </p>
                              </ToggleMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : null}

              {!singleLoading && !members?.length ? (
                <DynamicLordIcon
                  coverClass="bg-white"
                  icon="fqbvgezn"
                  subTitle="No members found for the this group"
                  title="Oops! No members yet!!"
                />
              ) : null}

              {}
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={() =>
                !data?.length > 0 ? handleOpenAlert() : handleOpenModal()
              }
              className="primary-btn position-sticky start-50
          translate-middle d-flex align-items-center gap-sm-2 fs-16 responsive  px-3 px-md-4 w-fit group-sticky-btn"
            >
              <i className="ri-add-line fs-21 lh-0"></i>Add Member
            </Button>
          )}

          {/* modal */}

          <GroupModal
            id={editData?._id}
            isOpen={Object.keys(editData)?.length ? true : false}
            onHide={() => setEditData({})}
            data={editData}
          />

          <ModelWrapper
            show={isOpen}
            onHide={() => {
              setIsOpen(false),
                validation.resetForm(),
                setIsEditPermission(false);
            }}
            title={isEditPermission ? "Edit Permission" : "Add Member"}
            className="modal-650px"
          >
            <Modal.Body ref={modalBodyRef} className="">
              <Form onSubmit={validation.handleSubmit}>
                <InputField
                  name="email"
                  id="email"
                  label="email address"
                  placeholder="enter email address"
                  value={validation.values.email}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.errors.email && validation.touched.email}
                  errorMessage={validation.errors.email}
                  readOnly={isEditPermission}
                />

                <h5 className="fs-16">Account Permissions</h5>
                <ul className="p-0 m-0">
                  {data?.length ? (
                    data?.map((item, index) => {
                      const title = item?.title;
                      return (
                        <li
                          key={index}
                          className={`p-3 br-10 ${
                            index % 2 == 0 ? "client-section-bg-color" : ""
                          }`}
                        >
                          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 justify-content-between">
                            <span className="text-capitalize fs-16 text-truncate d-block max-w-300px">
                              {title}
                            </span>
                            <Form.Group>
                              <Form.Select
                                id={`accounts[${index}].permission`}
                                name={`accounts[${index}].permission`}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={
                                  validation.values.accounts?.[index]
                                    ?.permission
                                }
                                // value={validation.account + index.permission}
                                className="fs-14 fw-medium v-fit  br-5 ms-auto text-capitalize"
                                // onChange={(e) =>
                                //   handleDefaultDateFIlterValue(e.target.value)
                                // }
                              >
                                <option value={groupAccessEnum.ADMIN_ACCESS}>
                                  admin access
                                </option>
                                <option value={groupAccessEnum.TRACK_AND_READ}>
                                  track and read
                                </option>
                                <option value={groupAccessEnum.READONLY}>
                                  read only
                                </option>
                                <option value={groupAccessEnum.NO_ACCESS}>
                                  no access
                                </option>
                              </Form.Select>
                            </Form.Group>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-center client-section-bg-color p-2 text-color-monsoon br-10">
                      Oops! No Accounts Yet
                    </li>
                  )}
                </ul>
                <div className="mt-3 d-flex gap-3 responsive">
                  <Button
                    className="light-gray-btn w-100 fs-16"
                    onClick={() => {
                      setIsOpen(false),
                        validation.resetForm(),
                        setIsEditPermission(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={actionLoading}
                    className="primary-btn w-100 fs-16"
                    type="submit"
                  >
                    {actionLoading ? "Loading..." : "Submit"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </ModelWrapper>
          {/* </SettingLayout> */}
        </div>
      </div>

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
        onClose={handleCloseAlert}
        isOpen={alertModal}
        onConfirm={handleOpenAccType}
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Group",
          description: "Are you sure you want to delete the Group?",
        }}
        onConfirm={handleConfirm}
        loading={singleLoading}
      />

      <CommonDeleteModal
        isOpen={isRemoveMember}
        onClose={handleCloseMemberModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Remove Member",
          description: "Are you sure you want to Remove this Member?",
        }}
        onConfirm={handleConfirmRemoveMember}
        loading={actionLoading}
        loadingContent="Removing..."
      />
    </>
  );
};

export default GroupDetails;
