import { Placeholder } from "react-bootstrap";

const TemplateLoading = ({ limit = 10, tableLoaderDataLength = 10 }) => {
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
          <div className={`h-40px w-40px`}>
            <Placeholder animation="glow">
              <Placeholder
                className={`bg-color-gray br-10 h-100 w-100`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
        <td
          className={`${
            (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
          } p-3 border-0`}
        >
          <div>
            <Placeholder animation="glow">
              <Placeholder
                className={`bg-color-gray br-10 h-100 w-180px`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
        <td
          className={`${
            (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
          } p-3 border-0`}
        >
          <div>
            <Placeholder animation="glow">
              <Placeholder
                className={`bg-color-gray br-10 h-100 w-180px`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
        <td
          className={`${
            (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
          } p-3 border-0`}
        >
          <div>
            <Placeholder animation="glow">
              <Placeholder
                className={`bg-color-gray br-10 h-100 w-180px`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
        <td
          className={`${
            (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
          } p-3 border-0`}
        >
          <div>
            <Placeholder animation="glow">
              <Placeholder
                className={`bg-color-gray br-10 h-100 w-180px`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
        <td
          className={`${
            (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
          } text-end p-3 border-0`}
        >
          <div>
            <Placeholder animation="glow">
              <Placeholder
                className={`bg-color-gray br-10 h-100 w-70px`}
                xs={2}
              />
            </Placeholder>
          </div>
        </td>
      </tr>
    );
  });
};

export default TemplateLoading;
