import QRCode from "qrcode";
import { awsS3 } from "../features/aws/helper/awsS3.controller.js";

export const generateQrCode = async (qrData, fileName) => {
  const qrCodeOptions = {
    errorCorrectionLevel: "H", // High
    type: "image/png",
    quality: 0.92,
    margin: 1,
  };

  // Generate QR code
  const qrCodeBuffer = await QRCode.toBuffer(String(qrData), qrCodeOptions);

  await awsS3.uploadFile({
    fileName,
    file: qrCodeBuffer,
  });

  return fileName;
};
