import PropTypes from "prop-types";
import { Col, Placeholder } from "react-bootstrap";
import { tableLoaderDataLength } from "../../../helpers/enum";

const LabelsLoading = ({ length = 12, limit = 12 }) => {
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
        md={6}
        lg={4}
        xl={4}
        xxl={3}
        key={index}
      >
        <div className={`bg-white cursor-pointer rounded-4 px-3 py-4`}>
          <div className={`d-flex align-items-center`}>
            <div className="d-flex align-items-center gap-3 w-100">
              <Placeholder animation="glow">
                <Placeholder
                  className={`w-30px h-30px rounded-circle min-w-30px min-h-30px`}
                  xs={2}
                />
              </Placeholder>

              <Placeholder animation="glow" className="w-100">
                <Placeholder
                  className={`bg-color-gray br-10 h-20px loading-w-300px`}
                />
              </Placeholder>
            </div>
          </div>
        </div>
      </Col>
    );
  });
};

LabelsLoading.propTypes = {
  length: PropTypes.number,
  limit: PropTypes.number,
};

export default LabelsLoading;
