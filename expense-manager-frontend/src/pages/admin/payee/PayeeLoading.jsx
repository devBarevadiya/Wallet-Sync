import PropTypes from "prop-types";
import { Col, Placeholder } from "react-bootstrap";
import { tableLoaderDataLength } from "../../../helpers/enum";

const PayeeLoading = ({ length = 12, limit = 12 }) => {
  const lengthArray = Array.from(
    { length: length >= limit ? limit : length || tableLoaderDataLength },
    (_, b) => b
  );
  return lengthArray.map((ele, index) => {
    return (
      <Col
        className={`categories-boxes px-2 mb-3`}
        xs={12}
        sm={6}
        xxl={3}
        key={index}
      >
        <div className="p-20px bg-white cursor-pointer h-100 responsive border common-border-color rounded-4 text-capitalize d-flex justify-content-between w-100">
          <div className="d-flex flex-column gap-12px w-100">
            <span className="d-flex flex-column gap-12px w-100">
              <Placeholder animation="glow" className="w-100">
                <Placeholder
                  className={`bg-color-gray rounded-2 h-15px max-w-150px w-100`}
                />
              </Placeholder>
              <Placeholder animation="glow" className="w-100">
                <Placeholder
                  className={`bg-color-gray rounded-2 h-15px w-100`}
                />
              </Placeholder>
              <Placeholder animation="glow" className="w-100">
                <Placeholder
                  className={`bg-color-gray rounded-2 h-15px max-w-200px w-100`}
                />
              </Placeholder>
              <Placeholder animation="glow" className="w-100">
                <Placeholder
                  className={`bg-color-gray rounded-2 h-15px max-w-150px w-100`}
                />
              </Placeholder>
            </span>
          </div>
        </div>
      </Col>
    );
  });
};
PayeeLoading.propTypes = {
  length: PropTypes.number,
  limit: PropTypes.number,
};
export default PayeeLoading;
