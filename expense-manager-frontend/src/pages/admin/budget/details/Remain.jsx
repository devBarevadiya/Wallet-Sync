import { memo } from "react";
import { Col, Row } from "react-bootstrap";
import BudgetCard from "../../../../components/admin/budget/ChartCard";
import Transactions from "../../../../components/admin/budget/Transactions";
import RemainList from "../../../../components/admin/budget/RemainList";
import { useSelector } from "react-redux";
import SubCategoryRemainList from "../../../../components/admin/budget/SubCategoryRemainList";

const Remain = () => {
  const { detailsData, showSubCategories } = useSelector(
    (store) => store.Budget
  );

  return (
    <Row className="mt-3 mt-md-4">
      <Col xxl={4} xl={6}>
        <BudgetCard type="remain" data={detailsData} />
      </Col>
      <Col xxl={4} xl={6}>
        {showSubCategories?.categories?.length > 0 ? (
          <SubCategoryRemainList data={detailsData} />
        ) : (
          <RemainList data={detailsData} />
        )}
      </Col>
      <Col xxl={4} xl={6}>
        <Transactions />
      </Col>
    </Row>
  );
};

export default memo(Remain);
