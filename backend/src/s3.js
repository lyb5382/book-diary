const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    // 🚨 1. DeleteBucketCommand -> DeleteObjectCommand
    DeleteObjectCommand
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET']
const missing = required.filter(k => !process.env[k])

if (missing.length) console.error('[S3 ENV Missing]', missing)

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const Bucket = process.env.S3_BUCKET

async function presignPut(Key, ContentType, sec = 300) {
    if (!Bucket) throw new Error('s3 bucket is undefined')
    if (!Key) throw new Error("Key is required")
    const cmd = new PutObjectCommand({ Bucket, Key, ContentType })
    return getSignedUrl(s3, cmd, { expiresIn: sec })
}

async function presignGet(Key, sec = 300) {
    if (!Bucket) throw new Error('S3 bucket is undefined')
    const cmd = new GetObjectCommand({ Bucket, Key })
    return getSignedUrl(s3, cmd, { expiresIn: sec })
}

// 🚨 2. 함수명 오타 수정: deletObject -> deleteObject
async function deleteObject(Key) {
    if (!Bucket) throw new Error('s3 bucket is undefined')
    // 🚨 3. Key 변수명 수정 및 유효성 검사
    if (!Key) throw new Error('Key is required')
    // 🚨 4. 명령어 수정: DeleteBucketCommand -> DeleteObjectCommand
    const cmd = new DeleteObjectCommand({ Bucket, Key })
    await s3.send(cmd)
    console.log(`[s3] Deleted: ${Key}`)
    return { ok: true, message: `Deleted: ${Key}` }
}

async function updateObject(Key, Body, ContentType) {
    if (!Bucket) throw new Error('s3 bucket is undefined')
    // 🚨 5. Key 변수명 수정 (소문자 key -> 대문자 Key)
    if (!Key) throw new Error('Key is required')
    const cmd = new PutObjectCommand({ Bucket, Key, Body, ContentType })
    await s3.send(cmd)
    // 🚨 6. 콘솔 로그 Key 변수 수정
    console.log(`[s3] Update: ${Key}`)
    return { ok: true, message: `Update: ${Key}` }
}

// 🚨 7. 모듈 export 이름 수정 (deleteObject로 통일)
module.exports = { s3, presignPut, presignGet, Bucket, deleteObject, updateObject }