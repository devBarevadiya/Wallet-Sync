import { Col, Placeholder, Row } from "react-bootstrap";
import { tableLoaderDataLength } from "../../../helpers/enum";

const BudgetLoading = ({ length = 12, limit = 12 }) => {
  const lengthArray = Array.from(
    { length: length >= limit ? limit : length || tableLoaderDataLength },
    (_, b) => b
  );

  return (
    <Row className="budget-list">
      {lengthArray?.map((_, index) => (
        <Col key={index} sm={6} lg={6} xl={3} className="mb-3 mb-sm-4">
          <Placeholder animation="glow">
            <Placeholder className={`w-100 h-200px br-18`} xs={2} />
          </Placeholder>
        </Col>
      ))}
    </Row>
  );
};

export default BudgetLoading;
