import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const awsConfig = {
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
};

const s3Client = new S3Client(awsConfig);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileName = searchParams.get("fileName");
        const fileType = searchParams.get("fileType");
        const couplename = searchParams.get("couplename");

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
        }

        if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
            return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
        }

        const targetBucket = process.env.AWS_S3_BUCKET_NAME || 'wedbliss.images';
        const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const folder = couplename ? couplename.replace(/[^a-zA-Z0-9-_]/g, '') : 'gallery';

        const objectKey = `${folder}/${uniqueId}-${sanitizedName}`;

        const command = new PutObjectCommand({
            Bucket: targetBucket,
            Key: objectKey,
            ContentType: fileType,
        });

        // 3 minutes Expiry
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 180 });
        const publicUrl = `https://${targetBucket}.s3.${awsConfig.region}.amazonaws.com/${objectKey}`;

        return NextResponse.json({ signedUrl, publicUrl, objectKey });
    } catch (error: unknown) {
        console.error("[upload-api] Error generating presigned URL:", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }
}
