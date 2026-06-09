import {
  Button,
  ButtonToolbar,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import ColorSelectField from "../../inputFields/ColorSelectField";
import { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import * as yup from "yup";
import { useFormik } from "formik";
import { useModalScroll } from "../../../helpers/customHooks";

const IconsModal = ({
  isOpen,
  onHide,
  callback,
  onlyIcons = false,
  paddingPercent = 20,
}) => {
  const totalElements = 81;
  const lengthArray = Array.from(
    { length: totalElements },
    (_, index) => `/images/icons/lightGrayColor/icon${index + 1}.png`
  );
  const colors = [
    "#5ED3DB",
    "#DD6FD2",
    "#6F6FDD",
    "#E58B4A",
    "#FA6838",
    "#6385FF",
    "#FDBD19",
    "#FFA000",
    "#CE9600",
    "#8D6E63",
    "#6D4C41",
    "#EC407A",
    "#C0447A",
    "#6A1B9A",
    "#AB47BC",
    "#BA68C8",
    "#00695C",
    "#00897B",
    "#4DB6AC",
    "#2E7D32",
    "#43A047",
    "#57CA60",
    "#5F7C8A",
    "#455A64",
    "#607D8B",
    "#9FA3B0",
    "#D32F2F",
    "#FF1744",
    "#FF6363",
    "#212121",
  ];

  // const iconRefs = useRef({});

  // const setIconRef = useCallback((ref, index) => {
  //   if (ref) {
  //     iconRefs.current[index] = ref;
  //   }
  // }, []);

  async function base64ToFile(base64String, mimeType, fileName) {
    const response = await fetch(base64String);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: mimeType });
    return file;
  }

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const initialValues = {
    color: colors[0],
    icon: "",
  };

  const validationSchema = yup.object({
    color: yup.string().required("color is required"),
    icon: yup.string().required("icon is required"),
  });

  const validation = useFormik({
    name: "iconModal",
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");

      // Fill the canvas background
      ctx.fillStyle = values.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = values.icon;

      img.onload = async () => {
        // const paddingPercent = paddingPercent;
        const padding = (paddingPercent / 100) * canvas.width;

        const aspectRatio = img.width / img.height;
        const iconHeight = canvas.height - 2 * padding;
        const iconWidth = iconHeight * aspectRatio;

        const iconX = (canvas.width - iconWidth) / 2;
        const iconY = (canvas.height - iconHeight) / 2;

        // Draw the image on the canvas
        ctx.drawImage(img, iconX, iconY, iconWidth, iconHeight);

        // Get image data only for the drawn icon area
        const imageData = ctx.getImageData(iconX, iconY, iconWidth, iconHeight);
        const data = imageData.data;
        const brightnessFactor = 1.5; // Increase brightness

        // RGB values for #B4B4B4
        const targetRed = 180;
        const targetGreen = 180;
        const targetBlue = 180;

        // Adjust brightness only where the color matches #B4B4B4
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const alpha = data[i + 3];

          // Check if the current pixel matches #B4B4B4 and is not transparent
          if (
            red === targetRed &&
            green === targetGreen &&
            blue === targetBlue &&
            alpha > 0
          ) {
            // Apply brightness increase
            data[i] = Math.min(255, red * brightnessFactor); // Red
            data[i + 1] = Math.min(255, green * brightnessFactor); // Green
            data[i + 2] = Math.min(255, blue * brightnessFactor); // Blue
          }
        }

        // Update the image data back on the canvas for the icon area only
        ctx.putImageData(imageData, iconX, iconY);

        const imgData = canvas.toDataURL("image/png");
        const file = await base64ToFile(imgData, "image/png", "icon.png");

        if (callback) {
          callback({ file, base64: imgData, color: values.color });
        }

        resetForm();
      };
    },
  });

  return (
    <Modal
      show={isOpen}
      centered={true}
      onHide={onHide}
      className="icon-modal modal-650px category-modal"
      // backdropClassName="bg-transparent"
      animation={true}
    >
      <Modal.Header className="mb-2 border-bottom common-border-color pb-3">
        <div className="d-flex align-items-center justify-content-between w-100">
          <Modal.Title className="text-capitalize fs-21 responsive d-flex align-items-center justify-content-between w-100">
            <span>
              <i
                className="ri-arrow-left-line cursor-pointer fs-4 me-3"
                onClick={() => onHide()}
              ></i>
              Add/Edit icon
            </span>

            <ButtonToolbar className="justify-content-end">
              <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip">Save Icon</Tooltip>}
              >
                <i
                  onClick={validation.handleSubmit}
                  className="ri-check-line ms-auto text-color-green fs-4 fw-bold cursor-pointer"
                ></i>
              </OverlayTrigger>
            </ButtonToolbar>
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body ref={modalBodyRef} className=" scroll-none">
        <Form onSubmit={validation.handleSubmit}>
          {/* <Button
            type="submit"
            className="fs-15 d-flex align-items-center gap-2 primary-btn"
          >
            <i className="fs-4 ri-arrow-up-circle-fill"></i> Upload Icon
          </Button> */}

          {validation.touched.color && validation.errors.color && (
            <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
              {validation.errors.color}
            </span>
          )}
          <span className="d-block mt-0"></span>
          {!onlyIcons && (
            <ColorSelectField
              onChange={(e) => validation.setFieldValue("color", e)}
              className="d-flex gap-3 flex-wrap mt-3 justify-content-center"
              label="select colors"
              value={validation.values.color}
              data={colors}
            />
          )}

          <div className="mt-5">
            <span className="text-capitalize mb-3 d-block d-flex align-items-center justify-content-between">
              Select Icons{" "}
              <span>
                {validation.touched.icon && validation.errors.icon && (
                  <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block fw-semibold">
                    {validation.errors.icon}
                  </span>
                )}
              </span>
            </span>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {lengthArray?.map((item, index) => {
                return (
                  <span
                    // ref={(ref) => setIconRef(ref, index)}
                    key={index}
                    onClick={() => validation.setFieldValue("icon", item)}
                    style={{
                      padding: "9px",
                      backgroundColor: `${
                        item === validation.values.icon
                          ? validation.values.color
                          : "#faf8fc"
                      }`,
                    }}
                    className="d-block h-40px w-40px d-flex align-items-center justify-content-center br-8"
                  >
                    <img
                      src={item}
                      className={`icon-image h-100 aspect-square object-fit-contain ${
                        item === validation.values.icon ? "brightness-2" : ""
                      }`}
                      alt="icon"
                    />
                  </span>
                );
              })}
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

IconsModal.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  callback: PropTypes.func,
  onlyIcons: PropTypes.bool,
  paddingPercent: PropTypes.number,
};

export default IconsModal;
