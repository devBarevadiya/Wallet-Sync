import { useSelector } from "react-redux";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import BudgetList from "./BudgetList";
import NoBudget from "./NoBudget";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getBudgetThunk } from "../../../store/actions";
import BudgetModal from "../../../components/admin/modals/budgetModals";
import {
  setHeadCategoryAmounts,
  setSubCategoryAmounts,
} from "../../../store/budget/slice";

const Budget = ({ user }) => {
  const { data, loading } = useSelector((state) => state.Budget);
  const { data: accountData } = useSelector((store) => store.Account);
  const [isModal, setIsModal] = useState(false);
  const dispatch = useDispatch();

  const handleSuccess = async () => {
    dispatch(getBudgetThunk());
  };

  const handleOpenModal = useCallback(() => {
    dispatch(setSubCategoryAmounts({}));
    dispatch(setHeadCategoryAmounts({}));
    setIsModal(true);
  }, [accountData?.length]);

  const handleDirectOpen = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  useEffect(() => {
    dispatch(getBudgetThunk());
  }, []);

  return (
    <>
      <div className="pt-4">
        <PageTitle
          onSuccess={handleSuccess}
          filterButton={false}
          title="Budget"
          subTitle="Control your expenses, achieve your dreams"
          buttonContent="Add Budget"
          onButtonClick={handleOpenModal}
          isAccountRequired
        />
        {data?.length > 0 || loading ? (
          <BudgetList />
        ) : (
          <NoBudget user={user} />
        )}
        {/* <BudgetDetails /> */}
      </div>
      <BudgetModal
        isOpen={isModal}
        onClose={handleCloseModal}
        open={handleDirectOpen}
      />
    </>
  );
};

export default Budget;
