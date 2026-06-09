import {
  Button,
  ButtonToolbar,
  Form,
  OverlayTrigger,
  Table,
  Tooltip,
} from "react-bootstrap";
import { useCallback, useState } from "react";

import {
  getAllGroupsThunk,
  leaveGroupThunk,
  switchGroupThunk,
} from "../../../store/group/thunk";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Image } from "../../../data/images";
import GroupSharingLoading from "./GroupSharingLoading";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import GroupModal from "../settings/modals/GroupModal";
import { getAccountThunk } from "../../../store/actions";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import TableTitle from "../../../components/admin/pageTitle/TableTitle";
import NoData from "../../../components/admin/NoData";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import AlertModal from "../../../components/admin/modals/AlertModal";
import { addAccount } from "../../../helpers/enum";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import { groupInstruction } from "../../../data/groupInstruction";

const GroupSharing = () => {
  const { data, loading, actionLoading, singleUserGroupData } = useSelector(
    (store) => store.Group
  );
  const { user } = useSelector((store) => store.Auth);
  const { data: accountData } = useSelector((store) => store.Account);

  const isAdmin = singleUserGroupData?.createBy?._id
    ? user?._id == singleUserGroupData?.createBy?._id
    : true;

  const [isOpen, setIsOpen] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [isLeaveModal, setIsLeaveModal] = useState(false);
  const [selectId, setSelectId] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const isCreatedGroup =
    data && data?.filter((item) => item?.createBy?._id == user?._id);

  const openSwitchModal = useCallback((id) => {
    setIsConfirmModal(true), setSelectId(id);
  }, []);

  const openLeaveModal = useCallback((id) => {
    setIsLeaveModal(true), setSelectId(id);
  }, []);

  const confirmSwitchGroup = useCallback(async () => {
    const response = await dispatch(
      switchGroupThunk({ id: selectId, userId: user?._id })
    );
    if (switchGroupThunk.fulfilled.match(response)) {
      dispatch(getAllGroupsThunk());
      dispatch(getAccountThunk());
      return true;
    }
    return false;
  }, [user, dispatch, selectId]);

  const confirmLeaveGroup = useCallback(async () => {
    const response = await dispatch(
      leaveGroupThunk({ id: selectId, userId: user?._id })
    );
    if (leaveGroupThunk.fulfilled.match(response)) {
      dispatch(getAccountThunk());
      return true;
    }
    return false;
  }, [dispatch, user, selectId]);

  const handleOpenModal = useCallback(() => setIsOpen(true), []);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType("");
  };

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

  const handleCloseDeleteModal = useCallback(() => {
    setIsConfirmModal(false), setSelectId(null), setIsLeaveModal(false);
  }, []);

  return (
    <>
      <div className="mt-4">
        {/* <SettingLayout> */}
        <PageTitle
          // filterButton={true}
          // setCanvas={() => setCanvas(true)}
          title="Group Sharing"
          subTitle="Explain the steps for setting up a new group"
          isButton={false}
          // onSuccess={getTransactionPara}
        />

        {loading || data?.length > 0 ? (
          <TableTitle
            className="mt-1 mt-md-3"
            // count={data?.length}
            title="Create Group"
            // buttonContent="Add Payee"
            // onClick={() => setIsModal(true)}
          />
        ) : (
          ""
        )}

        {loading || data?.length > 0 ? (
          <div className="bg-white rounded-bottom-4 border common-border-color border-top-0 h-100">
            <div
              className={`${
                // !data?.length
                //   ? "d-flex align-items-center justify-content-center"
                //   : ""
                ""
              } position-relative responsive group-layut`}
            >
              {/* <div className="bg-dark" style={{ minHeight: `calc(100% - (63px + 96px))` }}> */}

              {loading && !data?.length ? (
                <Table responsive>
                  <tbody>
                    <GroupSharingLoading />
                  </tbody>
                </Table>
              ) : (
                ""
              )}

              {!loading ? (
                data?.length ? (
                  <div className="px-3">
                    <h4 className="text-color-light-gray fs-16 m-0 pt-3">
                      Your Group
                    </h4>
                    <Table responsive className="align-middle">
                      <tbody>
                        {data?.map((item, index) => {
                          const title = item?.title;
                          const id = item?._id;
                          const createBy = item?.createBy?._id;
                          const isOwner = user?._id == createBy;
                          const currentMember = item?.members?.filter(
                            (ele) => ele?.user == user?._id
                          );
                          const isActive = currentMember?.[0]?.isActive;
                          const icon = item?.icon
                            ? import.meta.env
                                .VITE_DIGITAL_OCEAN_SPACES_BASE_URL + item?.icon
                            : Image.groupSharingImg;
                          return (
                            <tr key={index}>
                              <td
                                onClick={() =>
                                  isOwner
                                    ? nav(ADMIN.GROUP_DETAILS.PATH + `/${id}`)
                                    : nav(ADMIN.GROUP_USER.PATH + `/${id}`)
                                }
                                className={`py-3 ${
                                  data?.length == index + 1 ? "border-0" : ""
                                } 
                                  cursor-pointer
                                 border-dark-white-color`}
                              >
                                <div className="d-flex gap-3 align-items-center">
                                  <span className="text-color-gray d-flex gap-3 align-items-center">
                                    <img
                                      src={icon}
                                      className="w-50px h-50px border border-2 border-color-light-primary br-12 bg-color-primary-10 object-fit-cover"
                                      alt=""
                                    />
                                    <span className="d-flex flex-column">
                                      <span className="fs-16 max-w-300px text-truncate text-capitalize">
                                        {title}
                                      </span>

                                      {isOwner ? (
                                        <span className="text-color-light-green fs-12">
                                          Admin
                                        </span>
                                      ) : (
                                        <span className="text-color-light-gray fs-12">
                                          Member
                                        </span>
                                      )}
                                    </span>
                                  </span>
                                </div>
                              </td>
                              <td
                                onClick={() =>
                                  isOwner &&
                                  nav(ADMIN.GROUP_DETAILS.PATH + `/${id}`)
                                }
                                className={`${
                                  data?.length == index + 1 ? "border-0" : ""
                                } ${
                                  isOwner ? "cursor-pointer" : ""
                                } text-end pe-3 py-3 border-dark-white-color fs-14 text-nowrap`}
                              >
                                {isOwner ? (
                                  <div
                                    // to={
                                    //   isOwner
                                    //     ? ADMIN.GROUP_DETAILS.PATH + `/${id}`
                                    //     : ADMIN.GROUP_USER.PATH + `/${id}`
                                    // }
                                    className="text-color-gray"
                                  >
                                    <i className="ri-arrow-right-s-line fs-18"></i>

                                    {/* <Form className="">
                                      <ButtonToolbar className="justify-content-end">
                                        <OverlayTrigger
                                          placement="left"
                                          overlay={
                                            <Tooltip id="tooltip">
                                              {!isActive
                                                ? "Switch To Group"
                                                : "Leave From Group"}
                                            </Tooltip>
                                          }
                                        >
                                          <Form.Check
                                            disabled={actionLoading}
                                            checked={isActive}
                                            onChange={() =>
                                              isActive
                                                ? openLeaveModal(id)
                                                : openSwitchModal(id)
                                            }
                                            className={`switch lg me-1 ${
                                              actionLoading
                                                ? "opacity-loading"
                                                : ""
                                            }`}
                                            type="switch"
                                            id="push-notification"
                                          />
                                        </OverlayTrigger>
                                      </ButtonToolbar>
                                    </Form> */}

                                    {/* {!isActive ? (
                                    <span
                                      className="text-color-light-green cursor-pointer"
                                      onClick={() => switchGroup(id)}
                                    >
                                      {actionLoading
                                        ? "Switching..."
                                        : "Switch Group"}
                                    </span>
                                  ) : (
                                    <span
                                      className="text-color-invalid cursor-pointer"
                                      onClick={() => leaveGroup(id)}
                                    >
                                      {actionLoading ? "Leaving..." : "Leave"}
                                    </span>
                                  )} */}
                                  </div>
                                ) : (
                                  <ButtonToolbar className="justify-content-end">
                                    <OverlayTrigger
                                      placement="left"
                                      overlay={
                                        <Tooltip id="tooltip">
                                          {!isActive
                                            ? "Switch To Group"
                                            : "Leave From Group"}
                                        </Tooltip>
                                      }
                                    >
                                      <Form.Check
                                        disabled={actionLoading}
                                        checked={isActive}
                                        onChange={() =>
                                          isActive
                                            ? openLeaveModal(id)
                                            : openSwitchModal(id)
                                        }
                                        className={`switch lg me-1 ${
                                          actionLoading ? "opacity-loading" : ""
                                        }`}
                                        type="switch"
                                        id="push-notification"
                                      />
                                    </OverlayTrigger>
                                  </ButtonToolbar>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : null
              ) : null}
              {/* </div> */}
              {!loading ? (
                data?.length ? (
                  <div className="px-4 text-color-monsoon fs-14 border-top pt-4 common-border-color">
                    <p>
                      To ensure proper visibility and permissions for both
                      admins and members, please follow these guidelines:
                    </p>

                    <ul>
                      {groupInstruction?.map((item, index) => {
                        const title = item?.title;
                        const description = item?.descriptions;
                        return (
                          <li key={index} className="mt-3">
                            {index + 1 + ". " + title}
                            <ul>
                              {description?.map((item, index) => (
                                <li
                                  className="list-disc text-color-light-gray"
                                  key={index}
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>

                    <p>
                      Ensure that you set up accounts and groups in the correct
                      order to maintain proper visibility and permissions for
                      all members.
                    </p>
                  </div>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </div>
            {!loading ? (
              data?.length ? (
                <Button
                  onClick={() => setIsOpen(true)}
                  className={`${
                    isCreatedGroup?.length ? "opacity-0" : ""
                  } primary-btn position-sticky responsive start-50
        translate-middle group-sticky-btn fs-16`}
                  disabled={isCreatedGroup?.length}
                >
                  Create Group
                </Button>
              ) : null
            ) : null}
          </div>
        ) : (
          <NoData
            onButtonClick={
              !accountData?.length > 0 ? handleOpenAlert : handleOpenModal
            }
            buttonContent="Add Group"
            description="You haven’t shared anything in this group yet. Start sharing to fill this space!"
            title="No Group Sharing Found"
            image={Image.groupSharingImg}
          />
        )}

        <GroupModal isOpen={isOpen} onHide={() => setIsOpen(false)} />

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

        {/* </SettingLayout> */}
      </div>

      <CommonDeleteModal
        isOpen={isConfirmModal}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Switch to the Group",
          description: "Are you sure you want to Switch the Group?",
        }}
        onConfirm={confirmSwitchGroup}
        loading={actionLoading}
      />

      <CommonDeleteModal
        isOpen={isLeaveModal}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Leave from the Group",
          description: "Are you sure you want to Leave from Group?",
        }}
        onConfirm={confirmLeaveGroup}
        loading={actionLoading}
      />
    </>
  );
};

export default GroupSharing;
