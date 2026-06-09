import { useCallback, useEffect, useState } from "react";
import SettingLayout from "./Layout";
import AccountTypeModal from "./modals/AccountTypeModal";
import { useSelector } from "react-redux";
import {
  deleteAccountTypeThunk,
  getAccountTypeThunk,
} from "../../../store/actions";
import { useDispatch } from "react-redux";
import { Col, Row } from "react-bootstrap";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { setEditData } from "../../../store/accountType/slice";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";

const AccountType = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.AccountType);
  const [modal, setModal] = useState(false);
  const [openId, setOpenId] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const handleEditAccountType = (value) => {
    setModal(true);
    dispatch(setEditData(value));
  };

  const handleDeleteAccountType = (id) => {
    setDeleteId(id);
    setIsDelete(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false);
  }, []);

  const handleConfirm = useCallback(() => {
    dispatch(deleteAccountTypeThunk({ id: deleteId }));
  }, [deleteId, dispatch]);

  useEffect(() => {
    dispatch(getAccountTypeThunk());
  }, [dispatch]);
  
  return (
    <SettingLayout
      // buttonContent="add account type"
      // onClick={() => setModal(true)}
      pageTitleData={{
        buttonContent: "Add Account Type",
        onButtonClick: () => setModal(true),
      }}
    >
      <div className={`add-account-type p-3 pb-0`}>
        <Row className={`px-1`}>
          {data.map((ele) => {
            const id = ele?._id;
            const title = ele?.title;
            const icon =
              import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + ele?.icon;
            return (
              <Col
                className={`categories-boxes px-2 mb-3`}
                xs={12}
                sm={6}
                md={6}
                lg={12}
                xl={6}
                xxl={4}
                key={id}
              >
                <div className={`client-section-bg-color br-10 p-3`}>
                  <div className={`d-flex align-items-center`}>
                    <div
                      onClick={() => handleEditAccountType(ele)}
                      className={`aspect-square icon min-w-55px br-14 w-55px  overflow-hidden cursor-pointer`}
                    >
                      <img
                        src={icon}
                        alt={`icon-${id}`}
                        className={`h-100 w-100 object-fit-cover`}
                      />
                    </div>
                    <h4
                      onClick={() => handleEditAccountType(ele)}
                      className={`ms-12px text-truncate max-w-170px responsive fs-17 text-capitalize fw-medium lh-base mb-0 cursor-pointer`}
                    >
                      {title}
                    </h4>
                    <div className={`ms-auto ps-3`}>
                      <ToggleMenu
                        rootClass={"add-account-type"}
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
                          onClick={() => handleEditAccountType(ele)}
                        >
                          Edit
                        </p>
                        <p
                          className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                          onClick={() => handleDeleteAccountType(id)}
                        >
                          Delete
                        </p>
                      </ToggleMenu>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
        <AccountTypeModal
          isOpen={modal}
          onHide={() => {
            setModal(false);
          }}
        />
        <CommonDeleteModal
          isOpen={isDelete}
          onClose={handleCloseDeleteModal}
          backdropClassName={"backdrop-upper"}
          content={{
            title: "Delete Account Type",
            description: "Are you sure you want to delete the Account Type",
          }}  
          onConfirm={handleConfirm}
          // loading={actionLoading}
        />
      </div>
    </SettingLayout>
  );
};

export default AccountType;
