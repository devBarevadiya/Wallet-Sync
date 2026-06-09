import { useCallback, useEffect, useState } from "react";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import GeneratePromoCodeModal from "../../../components/admin/modals/promoCode/GeneratePromoCodeModal";
import { useSelector } from "react-redux";
import NoData from "../../../components/admin/NoData";
import { useDispatch } from "react-redux";
import {
  getPromoCodePaginationThunk,
  getPromoCodeThunk,
} from "../../../store/promoCode/thunk";
import { Button, Col, Row } from "react-bootstrap";
import { formatDate } from "../../../helpers/commonFunctions";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";
import ShowPromoCodesModal from "../../../components/admin/modals/promoCode/ShowPromoCodesModal";
import { setShowCodes } from "../../../store/promoCode/slice";
import PayeeLoading from "../payee/PayeeLoading";

const PromoCode = () => {
  const [showPromoModal, setPromoModal] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const { data, loading, pagination, paginationLoading } = useSelector(
    (state) => state.PromoCode
  );
  const dispatch = useDispatch();

  const openPromoModal = useCallback(() => {
    setPromoModal(true);
  }, []);

  const closePromoModal = useCallback(() => {
    setPromoModal(false);
  }, []);

  const generatePDF = (promoCodes) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Generated Promo Codes", 14, 15);

    const tableColumn = ["Code", "Valid From", "Valid Until", "Trial Days"];
    const tableRows = promoCodes.map((promo) => [
      promo.code,
      promo.validFrom.split("T")[0], // Extracting date part
      promo.validUntil.split("T")[0],
      promo.trialDays > 0 ? promo.trialDays : "Lifetime",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 10 },
      margin: { top: 20 },
      didDrawPage: (data) => {
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          180,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save("PromoCodes.pdf");
  };

  const showPromoCodeModal = useCallback((data) => {
    dispatch(setShowCodes(data));
    setIsPreview(true);
  }, []);

  const hidePromoCodeModal = useCallback(() => {
    setTimeout(() => {
      dispatch(setShowCodes([]));
    }, 200);
    setIsPreview(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    dispatch(getPromoCodePaginationThunk({ page: pagination?.page + 1 }));
  }, [pagination?.page]);

  useEffect(() => {
    if (!data?.length) {
      dispatch(getPromoCodeThunk());
    }
  }, []);

  return (
    <>
      <div className="pt-4">
        <PageTitle
          title="Promo codes"
          subTitle="Generate unique promo codes to offer discounts or free trials to your users." //
          //   onSuccess={getTransactionPara}
          buttonContent="Add Promo Codes"
          onButtonClick={openPromoModal}
        />

        {data?.length ? (
          <div>
            <div className=" invisible-scrollbar rounded-4">
              <div className={`category mt-3 pb-0`}>
                <Row className={`px-1`}>
                  {data?.map((item, index) => {
                    const tag = item?.tag || "Other promo codes";
                    const data = item?.data;
                    const firstData = data?.[0];
                    const validFrom = firstData?.validFrom;
                    const validUntil = firstData?.validUntil;
                    const trialDays = firstData?.trialDays;
                    return (
                      data?.length > 0 && (
                        <Col
                          className={`categories-boxes px-2 mb-2 py-1`}
                          xs={12}
                          sm={6}
                          xxl={3}
                          key={index}
                        >
                          <div
                            onClick={() => showPromoCodeModal(data)}
                            className="p-20px bg-white cursor-pointer h-100 responsive border common-border-color rounded-4 text-capitalize d-flex justify-content-between w-100"
                          >
                            <div className="w-100">
                              <span className="d-flex align-items-center justify-content-between mb-3">
                                <h5 className="text-capitalize max-w-300px text-truncate fs-20 fw-semibold mb-0">
                                  {tag}
                                </h5>
                                {/* <span className="fs-12 text-color-monsoon">
                                  <span className="main-text-color fw-medium">{data?.length}</span>{" "}
                                  {data?.length > 1 ? "codes" : "code"}
                                </span> */}
                                <ToggleMenu
                                  margin={"0px"}
                                  rootClass={"table"}
                                  onClose={() => setOpenId("")}
                                  onClick={(e) => {
                                    if (openId == tag) {
                                      setOpenId("");
                                      e.stopPropagation();
                                    } else {
                                      setOpenId(tag);
                                      e.stopPropagation();
                                    }
                                  }}
                                  isOpen={openId == tag}
                                >
                                  <p
                                    onClick={() => showPromoCodeModal(data)}
                                    className="text-color-secondary m-0 fs-12 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                  >
                                    Show codes
                                  </p>
                                  <p
                                    onClick={() => generatePDF(data)}
                                    className="text-color-secondary m-0 fs-12 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                                  >
                                    Download PDF
                                  </p>
                                </ToggleMenu>
                              </span>
                              <p className="fs-14 text-color-monsoon mb-2">
                                Valid From:{" "}
                                <span className="main-text-color fw-medium">
                                  {formatDate(validFrom, "DD-MM-yyyy")}
                                </span>
                              </p>
                              <p className="fs-14 text-color-monsoon mb-2">
                                Valid Until:{" "}
                                <span className="main-text-color fw-medium">
                                  {formatDate(validUntil, "DD-MM-yyyy")}
                                </span>
                              </p>
                              <p className="fs-14 text-color-monsoon mb-2">
                                Trial Days:{" "}
                                <span className="main-text-color fw-medium">
                                  {trialDays > 0 ? trialDays : "Lifetime"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Col>
                      )
                    );
                  })}
                </Row>
              </div>
            </div>
          </div>
        ) : loading ? (
          <Row className={`px-1 mt-3`}>
            <PayeeLoading />
          </Row>
        ) : (
          <NoData
            onButtonClick={openPromoModal}
            buttonContent="Add Promo Code"
            title="No Promo Code Found"
            description="No promo code found. Admins can add and manage promo codes to offer free trial on walletsync."
          />
        )}

        {pagination?.page < pagination?.totalPages && (
          <Button
            onClick={handleLoadMore}
            className="primary-btn v-fit py-2 br-8 mx-auto d-block fs-14 mt-3 mb-4"
          >
            {paginationLoading ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>

      <GeneratePromoCodeModal
        isOpen={showPromoModal}
        onHide={closePromoModal}
      />

      <ShowPromoCodesModal onHide={hidePromoCodeModal} isOpen={isPreview} />
    </>
  );
};

export default PromoCode;
