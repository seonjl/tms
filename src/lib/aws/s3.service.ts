import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getSinglePartPresignedUrl = async ({
  bucket,
  key,
  metadata,
}: {
  bucket: string;
  key: string;
  metadata?: { [key: string]: string };
}) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Metadata: metadata,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 6000 });

  return url;
};

export const getDownloadPresignedUrl = async ({
  bucket,
  key,
  downloadFileName,
}: {
  bucket: string;
  key: string;
  downloadFileName?: string;
}) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition:
        "attachment;" +
        (downloadFileName ? ` filename="${downloadFileName}"` : ""),
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 6000 });

    return url;
  } catch (error) {
    console.log("Error creating presigned URL", error);
    throw error;
  }
};
