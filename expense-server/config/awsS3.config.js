import aws from "@aws-sdk/client-s3";

import {
  DIGITAL_OCEAN_SPACES_ACCESS_KEY,
  DIGITAL_OCEAN_SPACES_REGION,
  DIGITAL_OCEAN_SPACES_SECRET_KEY,
} from "./env.js";

export const s3Client = new aws.S3({
  forcePathStyle: false,
  endpoint: "https://blr1.digitaloceanspaces.com",
  region: DIGITAL_OCEAN_SPACES_REGION,
  credentials: {
    accessKeyId: DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: DIGITAL_OCEAN_SPACES_SECRET_KEY,
  },
});
