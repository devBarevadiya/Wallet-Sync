import PropTypes from "prop-types";
import { Placeholder } from "react-bootstrap";
import { tableLoaderDataLength } from "../../../helpers/enum";

const RecordsLoader = ({ length, limit }) => {
  const lengthArray = Array.from(
    { length: length >= limit ? limit : length || tableLoaderDataLength },
    (_, b) => b
  );
  return (
    <>
      {lengthArray.map((ele, index) => {
        return (
          <tr key={index}>
            <td
              className={`${
                (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
              } p-3 border-0`}
            >
              {/* <div className="d-flex align-items-center gap-3">
                <img src={icon} className="w-40px h-40px" alt="" />
                <span>
                  <h6 className="max-w-300px text-truncate p-0 m-0 fs-16 text-capitalize">
                    {title}
                  </h6>
                  <span className="max-w-300px text-truncate fs-13 text-color-light-gray text-capitalize">
                    {accountTitle}
                  </span>
                </span>
              </div> */}
              <div className="d-flex align-items-center gap-3">
                <div className={`h-40px w-40px`}>
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-100`}
                      xs={2}
                    />
                  </Placeholder>
                </div>
                <div className={`w-100 d-flex flex-column`}>
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-300px`}
                      xs={2}
                    />
                  </Placeholder>
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-180px`}
                      xs={2}
                    />
                  </Placeholder>
                </div>
              </div>
            </td>
            <td
              className={`${
                (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
              } p-3 border-0 text-end`}
            >
              <div>
                <Placeholder animation="glow">
                  <Placeholder
                    className={`bg-color-gray br-10 h-100 w-90px`}
                    xs={2}
                  />
                </Placeholder>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
};

RecordsLoader.propTypes = {
  limit: PropTypes.any,
  length: PropTypes.any,
};

export default RecordsLoader;
