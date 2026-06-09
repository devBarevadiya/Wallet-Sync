import { useCallback, useEffect, useMemo, useState } from "react";
// import SettingLayout from "./Layout";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import ModelWrapper from "../../../components/ModelWrapper";
import InputField from "../../../components/inputFields/InputField";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  createLabelThunk,
  deleteLabelThunk,
  getLabelThunk,
  updateLabelThunk,
} from "../../../store/actions";
import { useDispatch } from "react-redux";
import ColorSelectField from "../../../components/inputFields/ColorSelectField";
import { useSelector } from "react-redux";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import LabelsLoading from "./LabelsLoading";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import TableTitle from "../../../components/admin/pageTitle/TableTitle";
import NoData from "../../../components/admin/NoData";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import { subscriptionTypeEnum } from "../../../helpers/enum";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import { isPremium } from "../../../helpers/commonFunctions";
import { useModalScroll } from "../../../helpers/customHooks";

const Labels = () => {
  const { data, loading, actionLoading, accessLimit } = useSelector(
    (store) => store.Label
  );
  const { user } = useSelector((store) => store.Auth);
  const [editId, setEditId] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [premiumModel, setPremiumModel] = useState(false);
  const [openId, setOpenId] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });
  const colors = useMemo(
    () => [
      "#5ED3DB",
      "#DD6FD2",
      "#6F6FDD",
      "#E58B4A",
      "#FA6838",
      "#6385FF",
      "#FDBD19",
      "#FFA000",
      "#CE9600",
      "#8D6E63",
      "#6D4C41",
      "#EC407A",
      "#C0447A",
      "#6A1B9A",
      "#AB47BC",
      "#BA68C8",
      "#00695C",
      "#00897B",
      "#4DB6AC",
      "#2E7D32",
      "#43A047",
      "#57CA60",
      "#5F7C8A",
      "#455A64",
      "#607D8B",
      "#9FA3B0",
      "#D32F2F",
      "#FF1744",
      "#FF6363",
      "#212121",
    ],
    []
  );

  const dispatch = useDispatch();

  const initialValue = {
    title: "",
    color: "#b772ff",
  };

  const validateSchema = yup.object({
    title: yup.string().required("title is required"),
    color: yup.string().required("color is required"),
  });

  const validation = useFormik({
    name: "labelValidation",
    enableReinitialize: true,
    initialValues: initialValue,
    validationSchema: validateSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editId) {
        const response = await dispatch(
          updateLabelThunk({ values, id: editId })
        );
        if (updateLabelThunk.fulfilled.match(response)) {
          setIsModal(false);
          setEditId("");
          resetForm();
        }
      } else {
        const response = await dispatch(createLabelThunk(values));
        if (createLabelThunk.fulfilled.match(response)) {
          setIsModal(false);
          resetForm();
        }
      }
    },
  });

  const handleEdit = useCallback(
    (item) => {
      setIsModal(true);
      setEditId(item._id);
      validation.setValues(
        {
          title: item.title,
          color: item.color,
        },
        [validation]
      );
    },
    [validation]
  );

  const triggerDeleteLabel = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Label Delete",
    text: "Are you sure you want to delete this Label? This change cannot be undone.",
    confirmButtonText: "Delete Label",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Label has been successfully deleted.",
  });

  const handleDelete = useCallback((id) => {
    setDeleteId(id), setIsDelete(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteLabelThunk(deleteId));
    if (deleteLabelThunk?.fulfilled?.match(response)) {
      return true;
    }
    return false;
  }, [dispatch, deleteId]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false), setDeleteId(null);
  }, []);

  const handleOpenFilterCanvas = useCallback(() => {
    if (
      isPremium() ||
      data.length < accessLimit
    ) {
      setIsModal(true);
    } else {
      setPremiumModel(true);
    }
  }, [accessLimit, data, user]);

  useEffect(() => {
    if (!data?.length) {
      dispatch(getLabelThunk());
    }
  }, []);

  return (
    <>
      <div className="pt-4">
        {/* <SettingLayout onClick={() => setIsModal(true)} buttonContent="Add Label"> */}
        <PageTitle
          // filterButton={true}
          // setCanvas={() => setCanvas(true)}
          title="Labels"
          subTitle="Outline the benefits of using labels."
          // onSuccess={getTransactionPara}
          buttonContent="Add Label"
          onButtonClick={handleOpenFilterCanvas}
        />
        {loading || data?.length > 0 ? (
          <div className="mt-3">
            {/* <TableTitle
              count={data?.length}
              title="Lables"
              // buttonContent="Add Label"
              onClick={handleOpenFilterCanvas}
              className="py-4"
            /> */}

            <div className="rounded-bottom-4">
              <div className={`category pb-0`}>
                <Row className={`px-1`}>
                  {!loading && data?.length
                    ? data?.map((item, index) => {
                        const title = item?.title;
                        const color = item?.color;
                        const id = item?._id;
                        return (
                          <Col
                            className={`categories-boxes px-2 mb-3`}
                            xs={12}
                            sm={6}
                            md={6}
                            lg={4}
                            xl={4}
                            xxl={3}
                            key={index}
                          >
                            <div
                              onClick={() => {
                                // e.stopPropagation(),
                                handleEdit(item);
                              }}
                              className={`bg-white border common-border-color cursor-pointer rounded-4 px-3 py-4`}
                            >
                              <div className={`d-flex align-items-center`}>
                                <span
                                  className="d-block w-30px h-30px rounded-circle min-w-30px min-h-30px"
                                  style={{ backgroundColor: color }}
                                ></span>
                                <h4
                                  className={`ms-12px text-truncate max-w-170px responsive fs-17 text-capitalize fw-medium lh-base mb-0 cursor-pointer`}
                                >
                                  {title}
                                </h4>
                                <div className={`ms-auto ps-3`}>
                                  <ToggleMenu
                                    rootClass={"table"}
                                    onClose={() => setOpenId("")}
                                    onClick={(e) => {
                                      if (openId == id) {
                                        e.stopPropagation(), setOpenId("");
                                      } else {
                                        e.stopPropagation(), setOpenId(id);
                                      }
                                    }}
                                    isOpen={openId == id}
                                  >
                                    <p
                                      className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                      onClick={() => {
                                        // e.stopPropagation(),
                                        handleEdit(item);
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
                              </div>
                            </div>
                          </Col>
                        );
                      })
                    : null}
                  {loading ? <LabelsLoading /> : null}
                </Row>
              </div>
            </div>
          </div>
        ) : (
          <NoData
            title="No Labels Found"
            description="Add your first label to categorize expenses and keep track of where your money goes."
            buttonContent="Add Labels"
            onButtonClick={handleOpenFilterCanvas}
          />
        )}

        <ModelWrapper
          onHide={() => {
            setEditId(""), validation.resetForm(), setIsModal(false);
          }}
          show={isModal}
          title={editId ? "Edit Label" : "Add Label"}
          className="modal-650px"
        >
          <Form onSubmit={validation.handleSubmit}>
            <Modal.Body ref={modalBodyRef}>
              <InputField
                label="Name"
                placeholder="Label Name"
                value={validation.values.title}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                name="title"
                id="title"
                invalid={validation.touched.title && validation.errors.title}
                errorMessage={validation.errors.title}
              />
              {useMemo(
                () => (
                  <ColorSelectField
                    onChange={(e) => validation.setFieldValue("color", e)}
                    className="d-flex gap-3 flex-wrap mt-3"
                    label="colors"
                    value={validation.values.color}
                    data={colors}
                  />
                ),
                [validation, colors]
              )}
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex gap-3 w-100">
                {useMemo(
                  () => (
                    <Button
                      className="light-gray-btn w-100"
                      onClick={() => {
                        setEditId(""),
                          validation.resetForm(),
                          setIsModal(false);
                      }}
                    >
                      Cancel
                    </Button>
                  ),
                  [validation]
                )}
                {useMemo(
                  () => (
                    <Button
                      type="submit"
                      className="primary-btn w-100"
                      // onClick={validation.handleSubmit}
                      disabled={actionLoading}
                    >
                      {`${actionLoading ? "Loading..." : "Submit"}`}
                    </Button>
                  ),
                  [actionLoading]
                )}
              </div>
            </Modal.Footer>
          </Form>
        </ModelWrapper>
        {/* </SettingLayout> */}
      </div>

      <PremiumModal
        isShow={premiumModel}
        onHide={() => setPremiumModel(false)}
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Label",
          description: "Are you sure you want to delete the Label",
        }}
        onConfirm={handleConfirm}
        loading={actionLoading}
      />
    </>
  );
};

export default Labels;
