import { useCallback, useEffect, useMemo, useState } from "react";
import { Tab, Nav, Placeholder } from "react-bootstrap";
import Remain from "./Remain";
import Plan from "./Plan";
import BudgetModal from "../../../../components/admin/modals/budgetModals";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  budgetDetailsThunk,
  budgetTransactionsThunk,
} from "../../../../store/actions";
import { useSelector } from "react-redux";
import { ADMIN } from "../../../../constants/routes";
import PageTitle from "../../../../components/admin/pageTitle/PageTitle";
import {
  capitalizeFirstLetter,
  isNotPremium,
} from "../../../../helpers/commonFunctions";
import {
  clearCategoryData,
  setHeadCategoryAmounts,
  setSelectHeadCategory,
  setSelectedSubCategory,
  setShowSubCategories,
  setSubCategoryAmounts,
} from "../../../../store/budget/slice";
import PremiumModal from "../../../../components/admin/modals/PremiumModal";

const BudgetDetails = () => {
  const { detailsData, transactionPagination, filterData, loading } =
    useSelector((store) => store.Budget);
  const [key, setKey] = useState("plan");
  const [isModal, setIsModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [isPremiumModal, setIsPremiumModal] = useState(false);
  const isEdit = useMemo(() => Object.keys(editData)?.length, [editData]);
  const { id } = useParams();
  const dispatch = useDispatch();
  const handleOpenModal = useCallback(() => {
    setEditData({});
    setIsModal(true);
  }, []);

  const nav = useNavigate();

  const handleOpenPremiumModal = useCallback(() => {
    setIsPremiumModal(true);
  }, []);

  const handleClosePremiumModal = useCallback(() => {
    setIsPremiumModal(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch(setSelectHeadCategory({}));
    dispatch(clearCategoryData());
    dispatch(setShowSubCategories([]));
    setEditData({});
    setIsModal(false);
  }, [dispatch]);

  const handleOpenModalDirectly = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleCloseModalDirectly = useCallback(() => {
    setIsModal(false);
  }, []);

  const handleSuccess = useCallback(() => {
    // dispatch(setShowSubCategories({}));
    // dispatch(budgetDetailsThunk(id));
    // dispatch(
    //   budgetTransactionsThunk({ id, values: { page: 1, ...filterData } })
    // );
  }, [id, filterData, dispatch]);

  const handleEditBudgte = () => {
    setEditData(detailsData);
    setIsModal(true);
  };

  const handleEditSuccess = useCallback(() => {
    dispatch(setShowSubCategories({}));
    dispatch(budgetDetailsThunk(id));
    dispatch(
      budgetTransactionsThunk({
        id,
        values: { page: transactionPagination?.page || 1, ...filterData },
      })
    );
  }, [id, transactionPagination, filterData, dispatch]);

  useEffect(() => {
    dispatch(budgetDetailsThunk(id));
    dispatch(
      budgetTransactionsThunk({ id, values: { page: 1, ...filterData } })
    );
  }, [id, filterData, dispatch]);

  return (
    <section className="pt-3 mb-3 mb-xl-0">
      <PageTitle
        onSuccess={handleSuccess}
        filterButton={false}
        title="Budget"
        subTitle="Control your expenses, achieve your dreams"
        buttonContent="Create Budget"
        isAccountRequired
        onButtonClick={() => {
          if (isNotPremium()) {
            handleOpenPremiumModal();
          } else {
            handleOpenModal();
            dispatch(setSelectHeadCategory({}));
            dispatch(clearCategoryData());
            dispatch(setShowSubCategories([]));
            dispatch(setSelectedSubCategory({}));
            dispatch(setSubCategoryAmounts({}));
            dispatch(setHeadCategoryAmounts({}));
          }
        }}
      />
      <div className="responsive  budget-details bg-white mt-3 br-18 border common-border-color px-3">
        <div className="d-flex py-md-4 py-3 justify-content-between flex-row gap-3 flex-wrap border-bottom common-border-color row-gap-3">
          <div className="d-flex justify-content-start align-items-center">
            <Link
              to={ADMIN.BUDGET.PATH}
              className="ri-arrow-left-s-line d-block cursor-pointer fs-30 text-color-monsoon"
            ></Link>
            <img
              src="https://guardianshot.blr1.digitaloceanspaces.com/expense/avatar/e55ed62e-e51d-4367-83db-bc0a918c81c9.png"
              // src="https://guardianshot.blr1.digitaloceanspaces.com/expense/Cash/2ad69021-2026-4cb5-8781-fa18fa0469c1.png"
              alt="img"
              className="w-55px h-55px"
              // className="wallet-icon"
            />
            <div className="d-flex gap-1 ps-3 flex-column justify-content-center align-items-start">
              <span className="fw-medium fs-18 text-capitalize max-w-300px truncate-line-1 d-block text-break">
                {loading ? (
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-180px`}
                      xs={2}
                    />
                  </Placeholder>
                ) : (
                  detailsData?.name
                )}
              </span>
              <span className="bg-dark-white-color br-5 fs-14 fw-medium text-color-monsoon px-2 py-1">
                {loading ? (
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-100px`}
                      xs={2}
                    />
                  </Placeholder>
                ) : (
                  capitalizeFirstLetter(detailsData?.period)
                )}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2 justify-content-center align-items-center ms-auto">
            <div
              onClick={!loading ? handleEditBudgte : undefined}
              className="d-flex border cursor-pointer common-border-color py-2 px-3 br-8 justify-content-center align-items-center gap-1"
            >
              <i className="ri-pencil-line fs-21 text-color-monsoon"></i>
              <span className="fs-15 fw-medium d-none d-sm-block">
                Edit Budget
              </span>
            </div>
            {/* <div
              onClick={() => {
                handleOpenModal();
                dispatch(setSelectHeadCategory({}));
                dispatch(clearCategoryData());
                dispatch(setShowSubCategories([]));
                dispatch(setSelectedSubCategory({}));
                dispatch(setSubCategoryAmounts({}));
                dispatch(setHeadCategoryAmounts({}));
              }}
              className="d-flex cursor-pointer border common-border-color py-1 px-3 br-8 justify-content-center align-items-center gap-1"
            >
              <i className="ri-add-circle-line fs-24 text-color-monsoon"></i>{" "}
              <span className="fs-16 fw-medium">Create New</span>
            </div> */}
          </div>
        </div>
        {/* Tabs inside budget-details */}
        <Tab.Container
          activeKey={key}
          onSelect={(k) => {
            setKey(k), dispatch(setShowSubCategories({}));
          }}
        >
          <Nav variant="pills" className="justify-content-start mt-2">
            <Nav.Item>
              <Nav.Link
                eventKey="plan"
                className={`bg-transparent text-color-inactive fs-20 fw-medium tab-link ${
                  key === "plan" ? "active-tab" : ""
                }`}
              >
                Plan
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="remain"
                className={`text-color-inactive bg-transparent fs-20 fw-medium tab-link ${
                  key === "remain" ? "active-tab" : ""
                }`}
              >
                Remaining
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Tab.Container>
      </div>

      {key === "plan" ? <Plan /> : <Remain />}

      <PremiumModal isShow={isPremiumModal} onHide={handleClosePremiumModal} />

      <BudgetModal
        isOpen={isModal}
        onClose={handleCloseModal}
        open={handleOpenModalDirectly}
        close={handleCloseModalDirectly}
        editData={editData}
        onSuccess={
          isEdit ? () => handleEditSuccess() : () => nav(ADMIN.BUDGET.PATH)
        }
      />
    </section>
  );
};

export default BudgetDetails;
