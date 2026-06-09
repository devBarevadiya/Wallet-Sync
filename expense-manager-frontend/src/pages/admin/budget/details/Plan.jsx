import BudgetCard from "../../../../components/admin/budget/ChartCard";
import CategoryList from "../../../../components/admin/budget/CategoryList";
import { Col, Row } from "react-bootstrap";
import Transactions from "../../../../components/admin/budget/Transactions";
import { useSelector } from "react-redux";

const Plan = () => {
  const { detailsData, loading } = useSelector((store) => store.Budget);
  return (
    <Row className="mt-3 mt-md-4">
      <Col xxl={4} xl={6}>
        <BudgetCard type="plan" data={detailsData} />
      </Col>
      <Col xxl={4} xl={6}>
        <CategoryList data={detailsData} loading={loading} />
      </Col>
      <Col xxl={4} xl={6}>
        <Transactions />
      </Col>
    </Row>
  );
};

export default Plan;
