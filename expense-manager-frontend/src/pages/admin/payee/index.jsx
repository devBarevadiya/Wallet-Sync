import { useCallback, useEffect, useMemo, useState } from "react";
import SettingLayout from "../settings/Layout";
import PayeeModal from "../../../components/admin/modals/PayeeModal";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  deleteMultiplePayeeThunk,
  getAllPayeeThunk,
} from "../../../store/actions";
import { Col, Row, Table } from "react-bootstrap";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import PayeeLoading from "./PayeeLoading";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import TableTitle from "../../../components/admin/pageTitle/TableTitle";
import NoData from "../../../components/admin/NoData";
import parsePhoneNumberFromString from "libphonenumber-js";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";

const Payee = () => {
  const { data, loading } = useSelector((store) => store.Payee);
  const [isModal, setIsModal] = useState(false);
  const [item, setItem] = useState({});
  const [openId, setOpenId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isDelete, setIsDelete] = useState(false);

  const dispatch = useDispatch();

  const onHide = () => {
    setIsModal(false);
    setItem({});
  };

  const handleEdit = (item) => {
    setItem(item);
    setIsModal(true);
  };

  const formatPhoneNumber = (phone) => {
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (phoneNumber) {
      return phoneNumber.formatInternational(); // Formats as +91 98765 43210
    }
    return "";
  };

  const triggerDeleteLabel = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Payee Delete",
    text: "Are you sure you want to delete this Payee? This change cannot be undone.",
    confirmButtonText: "Delete Payee",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Payee has been successfully deleted.",
  });

  const handleDelete = (id) => {
    setDeleteId(id), setIsDelete(true);
  };

  const handleOpenModal = useCallback(() => setIsModal(true), []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false), setDeleteId(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(
      deleteMultiplePayeeThunk({ ids: [deleteId] })
    );
    if (deleteMultiplePayeeThunk?.fulfilled?.match(response)) {
      return true;
    }
    return false;
  }, [dispatch, deleteId]);

  useEffect(() => {
    if (!data?.length) {
      dispatch(getAllPayeeThunk());
    }
  }, []);

  return (
    <>
      <div className="pt-4">
        {/* <SettingLayout onClick={handleOpenModal} buttonContent="Add Payee"> */}

        <PageTitle
          // filterButton={true}
          // setCanvas={() => setCanvas(true)}
          title="Payee"
          subTitle="Start by choosing the correct payee from a list"
          // onSuccess={getTransactionPara}
          buttonContent="Add Payee"
          onButtonClick={handleOpenModal}
        />

        {loading || data?.length ? (
          <div>
            {/* <TableTitle
              count={data?.length}
              title="Payee"
              // buttonContent="Add Payee"
              className="py-4"
              onClick={handleOpenModal}
            /> */}

            <div className=" invisible-scrollbar rounded-4">
              <div className={`category mt-3 pb-0`}>
                <Row className={`px-1`}>
                  {!loading && data?.length
                    ? data?.map((item, index) => {
                        const name = item?.name;
                        const email = item?.email || "";
                        const mobile = item?.mobile || "";
                        const business = item?.business || "";
                        const id = item?._id;
                        return (
                          <Col
                            className={`categories-boxes px-2 mb-3`}
                            xs={12}
                            sm={6}
                            xxl={3}
                            key={index}
                          >
                            <div
                              onClick={() => {
                                setItem(item), setIsModal(true);
                                // setOpenId("");
                              }}
                              className="p-20px bg-white cursor-pointer h-100 responsive border common-border-color rounded-4 text-capitalize d-flex justify-content-between w-100"
                            >
                              <div className="d-flex flex-column gap-12px">
                                <span className="d-flex align-items-center text-nowrap fs-16 fw-medium">
                                  name :-{" "}
                                  <span className="max-w-300px text-break text-wrap mx-2 mx-sm-3 truncate-line-1 fw-normal text-color-light-gray">
                                    {name}
                                  </span>
                                </span>
                                <span className="d-flex align-items-center text-nowrap fs-16 fw-medium">
                                  email :-{" "}
                                  <span className="max-w-300px text-lowercase text-break text-wrap mx-2 mx-sm-3 truncate-line-1 fw-normal text-color-light-gray">
                                    {email}
                                  </span>
                                </span>
                                <span className="d-flex align-items-center text-nowrap fs-16 fw-medium">
                                  mobile :-{" "}
                                  <span className="max-w-300px text-break text-wrap mx-2 mx-sm-3 truncate-line-1 fw-normal text-color-light-gray">
                                    {formatPhoneNumber("+" + mobile.toString())}
                                  </span>
                                </span>
                                <span className="d-flex align-items-center text-nowrap fs-16 fw-medium">
                                  business :-{" "}
                                  <span className="max-w-300px text-break text-wrap mx-2 mx-sm-3 truncate-line-1 fw-normal text-color-light-gray">
                                    {business}
                                  </span>
                                </span>
                              </div>
                              <ToggleMenu
                                margin={"0px"}
                                rootClass={"table"}
                                onClose={() => setOpenId("")}
                                onClick={(e) => {
                                  if (openId == id) {
                                    setOpenId("");
                                    e.stopPropagation();
                                  } else {
                                    setOpenId(id);
                                    e.stopPropagation();
                                  }
                                }}
                                isOpen={openId == id}
                              >
                                <p
                                  className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                  onClick={() => {
                                    setItem(item), setIsModal(true);
                                    // setOpenId("");
                                  }}
                                >
                                  Edit
                                </p>
                                <p
                                  className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                  onClick={() => handleDelete(id)}
                                >
                                  Delete
                                </p>
                              </ToggleMenu>
                            </div>
                          </Col>
                        );
                      })
                    : null}
                  {loading ? <PayeeLoading /> : null}
                </Row>
              </div>
            </div>
          </div>
        ) : (
          <NoData
            onButtonClick={handleOpenModal}
            buttonContent="Add Payee"
            title="No Payee Found"
            description="Add payees to easily organize and manage your  transactions in one place."
          />
        )}

        {/* payee modal */}
        <PayeeModal
          show={isModal}
          onHide={onHide}
          isLoading={loading}
          item={item}
        />
        {/* </SettingLayout> */}

        <CommonDeleteModal
          isOpen={isDelete}
          onClose={handleCloseDeleteModal}
          backdropClassName={"backdrop-upper"}
          content={{
            title: "Delete Payee",
            description: "Are you sure you want to delete the Payee",
          }}
          onConfirm={handleConfirm}
          loading={loading}
        />
      </div>
    </>
  );
};

export default Payee;
