import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client } from "../../../config/awsS3.config.js";
import { DIGITAL_OCEAN_BUCKET_NAME } from "../../../config/env.js";

export class awsS3 {
  static uploadFile = async ({ fileName, file, ACL }) => {
    try {
      const bucketParams = {
        Bucket: DIGITAL_OCEAN_BUCKET_NAME,
        Key: fileName,
        Body: file,
        ACL: ACL || "public-read",
      };
      const data = await s3Client.send(new PutObjectCommand(bucketParams));
      return data;
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  };

  static deleteFile = async ({ fileName }) => {
    try {
      const deleteBucketParams = {
        Bucket: DIGITAL_OCEAN_BUCKET_NAME,
        Key: fileName,
      };
      await s3Client.send(new DeleteObjectCommand(deleteBucketParams));
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  };

  static updateFile = async ({ oldFileName, fileName, file, ACL }) => {
    try {
      // delete old file
      if (oldFileName) {
        await this.deleteFile({
          fileName: oldFileName,
        });
      }

      // upload new file
      return await this.uploadFile({
        fileName,
        file,
        ACL,
      });
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  };

  static preSignedURL = async ({ fileName, contentType, ACL }) => {
    try {
      const bucketParams = {
        Bucket: DIGITAL_OCEAN_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
        ACL: ACL || "public-read",
      };
      const url = await getSignedUrl(
        s3Client,
        new PutObjectCommand(bucketParams),
        { expiresIn: 15 * 60 }
      );

      return url;
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  };
}
