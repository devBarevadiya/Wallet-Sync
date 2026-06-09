import { useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formateAmount } from "../../../helpers/commonFunctions";
import { creditDebitEnum, transactionTypeEnum } from "../../../helpers/enum";
import { format, isToday, isYesterday } from "date-fns";
import {
  Button,
  ButtonToolbar,
  OverlayTrigger,
  Table,
  Tooltip,
} from "react-bootstrap";
import { toastError } from "../../../config/toastConfig";
import { useDispatch } from "react-redux";
import { getTransactionReportThunk } from "../../../store/actions";
import { useSelector } from "react-redux";
import { IconsImage, Image } from "../../../data/images";

const Report = ({ user = {}, filter = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false); // Track if logo is loaded

  const { reportData, reportLoading: loading } = useSelector(
    (store) => store.Transaction
  );
  const flatData = reportData?.flatMap((item) => item?.transaction);

  const dispatch = useDispatch();

  const pdfRef = useRef();

  const handleLogoLoad = () => {
    setLogoLoaded(true); // Set logo loaded when the image finishes loading
  };

  const downloadPDF = async () => {
    setIsLoading(true);

    try {
      await dispatch(getTransactionReportThunk(filter)); // Fetch data

      setTimeout(async () => {
        if (!pdfRef.current) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        let yOffset = 10; // Initial Y position

        // Load the logo correctly
        const loadLogo = new Promise((resolve, reject) => {
          const img = document.createElement("img"); // FIXED: Use document.createElement
          img.src = Image.blackLogo;
          img.crossOrigin = "anonymous"; // Prevent CORS issues

          img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png")); // Convert to Base64
          };

          img.onerror = function () {
            reject(new Error("Failed to load logo"));
          };
        });

        const logoBase64 = await loadLogo; // Wait for logo to load

        // Add logo to PDF
        pdf.addImage(logoBase64, "PNG", 10, 10, 50, 12); // Adjust width & height
        yOffset += 20; // Move down after the logo

        const rows = pdfRef.current.querySelectorAll("tr"); // Select all table rows

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];

          // Convert each row to an image
          const canvas = await html2canvas(row, {
            useCORS: true,
            scale: 2, // Increase resolution
            backgroundColor: "#fff", // Ensure white background
          });
          const imgData = canvas.toDataURL("image/png");
          const rowHeight = (canvas.height * 190) / canvas.width; // Scale row height to fit PDF width

          // If row exceeds remaining space, add new page
          if (yOffset + rowHeight > pdfHeight - 20) {
            pdf.addPage();
            yOffset = 10;
          }

          // Add row image to PDF
          pdf.addImage(imgData, "PNG", 10, yOffset, 190, rowHeight);
          yOffset += rowHeight + 5; // Move down for next row
        }

        pdf.save("transactions_report.pdf");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toastError("Failed to download report");
      setIsLoading(false);
    }
  };

  const countTotalAmount = useMemo(() => {
    const allIdTotal = flatData?.reduce((acc, curr) => {
      return curr?.type == transactionTypeEnum.INCOME
        ? acc + curr?.amount
        : acc - curr?.amount;
    }, 0);
    return allIdTotal;
  }, [flatData]);

  return (
    <div className="">
      <ButtonToolbar className="justify-content-end">
        <OverlayTrigger
          placement="left"
          overlay={<Tooltip id="tooltip">Download Transactions PDF</Tooltip>}
        >
          <Button
            disabled={loading || isLoading}
            onClick={downloadPDF}
            className={`d-flex align-items-center cursor-pointer border-0 justify-content-center bg-color-primary text-white h-40px w-45px br-8`}
          >
            {!loading && !isLoading ? (
              <i className="ri-download-2-line fs-19"></i>
            ) : (
              <img
                className="w-20px"
                style={{ filter: "brightness(150%)" }}
                src="https://res-1.cdn.office.net/officeonline/hashed/a3596c17dad9a003/progress.gif"
                alt=""
              />
            )}
          </Button>
        </OverlayTrigger>
      </ButtonToolbar>

      <div
        ref={pdfRef}
        className="p-0 bg-white position-absolute text-start"
        style={{ width: "850px", top: "-10000%" }}
        // style={{ left: "0" }}
      >
        <div className="br-12 border overflow-hidden">
          {/* Add onLoad event to the image */}
          <img
            src={Image.blackLogo}
            className="mx-2 mb-3 h-50px"
            alt="Logo"
            onLoad={handleLogoLoad} // Ensure the logo is loaded
          />

          <Table className="mb-0 w-100 border">
            <tbody>
              {flatData?.map((item, index1) => {
                const title = item?.category?.title;
                const toAccountTitle = item?.to?.title;
                const creditDebit = item?.creditDebit;
                const accountTitle =
                  creditDebit == creditDebitEnum.DEBIT
                    ? toAccountTitle
                    : item?.account?.title;
                const amount = item?.amount;
                const type = item?.type;
                const icon =
                  type == transactionTypeEnum.TRANSFER
                    ? creditDebit == creditDebitEnum.CREDIT
                      ? IconsImage.other.creditTransferIcon
                      : IconsImage.other.debitTransferIcon
                    : import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                      item?.category?.icon;
                const currencySymbol = item?.currency?.symbol;
                const note = item?.note;
                const payee = item?.payee?.name || "";
                const labels = item?.labels;
                const date = new Date(item?.date);
                const createdByUser =
                  (item?.user?._id !== user?._id && item?.user?.username) || "";
                const formattedDate = isToday(date)
                  ? "Today"
                  : isYesterday(date)
                  ? "Yesterday"
                  : format(date, "dd MMM yyyy");

                const formattedTime = format(date, "h:mm a");
                const toAccount = item?.to?.title || "";

                return (
                  <tr key={index1} className={`mt-4`}>
                    <td
                      className={`p-3 border-0 cursor-pointer ${
                        index1 % 2 == 0 ? "client-section-bg-color" : ""
                      }`}
                    >
                      <div className="d-flex gap-3">
                        <div className="d-flex gap-3">
                          <img
                            src={icon}
                            className="w-40px h-40px br-8"
                            alt=""
                          />
                          <span>
                            <h6 className="p-0 m-0 fs-16 text-capitalize max-w-300px text-truncate pe-5">
                              {title}
                            </h6>
                            <span className="fs-14 text-color-monsoon text-capitalize max-w-300px text-truncate d-block mt-1">
                              {/* {accountTitle} */}
                              {type == transactionTypeEnum.TRANSFER ? (
                                <span>
                                  <span
                                    className={`${
                                      creditDebit == creditDebitEnum.DEBIT
                                        ? ""
                                        : "text-color-light-gray"
                                    }`}
                                  >
                                    {item?.account?.title}{" "}
                                  </span>
                                  <i className="ri-arrow-right-long-fill"></i>{" "}
                                  <span
                                    className={`${
                                      creditDebit == creditDebitEnum.DEBIT
                                        ? "text-color-light-gray"
                                        : ""
                                    }`}
                                  >
                                    {toAccount}
                                  </span>
                                </span>
                              ) : (
                                item?.account?.title
                              )}
                            </span>
                            {note && (
                              <span className="fs-14 text-color-monsoon text-capitalize max-w-300px truncate-line-1 d-block mt-1">
                                Note: {note}
                              </span>
                            )}
                            {payee && (
                              <span className="fs-14 text-color-monsoon text-capitalize max-w-300px truncate-line-1 d-block mt-1">
                                Payer: {payee}
                              </span>
                            )}
                            {labels?.length > 0 && (
                              <ul className="p-0 m-0 d-flex align-items-center gap-2 mt-2 flex-wrap">
                                {labels?.map((item, index) => {
                                  return (
                                    <li
                                      key={index}
                                      style={{
                                        backgroundColor: item?.color,
                                      }}
                                      className="fs-12 text-white px-2 py-1 br-5 max-w-300px d-block truncate-line-1 text-break"
                                    >
                                      {item?.title}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`p-3 border-0 ${
                        index1 % 2 == 0 ? "client-section-bg-color" : ""
                      }`}
                    >
                      <div className="d-flex justify-content-end">
                        <span className="d-flex flex-column align-items-end">
                          <span
                            className={`${
                              type == transactionTypeEnum.INCOME ||
                              creditDebit == creditDebitEnum.CREDIT
                                ? "text-color-light-green"
                                : type == transactionTypeEnum.EXPENSE ||
                                  creditDebit == creditDebitEnum.DEBIT
                                ? "text-color-invalid"
                                : ""
                            } fs-15 fw-medium text-nowrap`}
                          >
                            {type == transactionTypeEnum.INCOME ||
                            creditDebit == creditDebitEnum.CREDIT
                              ? "+ "
                              : type == transactionTypeEnum.EXPENSE ||
                                creditDebit == creditDebitEnum.DEBIT
                              ? "- "
                              : ""}
                            {currencySymbol + formateAmount({ price: amount })}
                          </span>
                          <span className="fs-12 text-color-monsoon text-end mt-1">
                            {formattedDate} {formattedTime}
                          </span>
                          {createdByUser && (
                            <span className="fs-12 text-color-monsoon text-end text-capitalize max-w-300px text-truncate d-block">
                              By: {createdByUser}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="text-end border-top " colSpan={2}>
                  Total balance:{" "}
                  <span
                    className={`${
                      countTotalAmount >= 0
                        ? "text-color-light-green"
                        : "text-color-invalid"
                    } fs-16 fw-medium ms-3`}
                  >
                    {formateAmount({ price: countTotalAmount })}
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Report;
