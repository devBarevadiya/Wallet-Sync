import { Placeholder } from "react-bootstrap";
import { tableLoaderDataLength } from "../../../helpers/enum";

const GroupSharingLoading = ({ length = 10, limit = 10 }) => {
  const lengthArray = Array.from(
    { length: length >= limit ? limit : length || tableLoaderDataLength },
    (_, b) => b
  );
  return lengthArray.map((ele, index) => {
    return (
      <tr key={index}>
        <td
          className={`${
            (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
          } p-3 border-0`}
        >
          <div className="d-flex align-items-center gap-3">
            <div className={`w-100 d-flex flex-column`}>
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
                className={`bg-color-gray br-10 h-100 w-70px ms-3`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
      </tr>
    );
  });
};

export default GroupSharingLoading;
