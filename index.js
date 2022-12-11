const fileOperation = require('./lib/s3MoveFile.js')

exports.handler = async event => {
    let body
    const key = event.Records[0].s3.object.key
    const bucket = event.Records[0].s3.bucket.name

    console.log(JSON.stringify(event))
    console.log('event => ' + key)
    console.log('event => ' + bucket)
    try{
        const params = {
            Bucket: bucket
        }
        const files = await fileOperation.getAllFilesInRoot(params)
        console.log(files)
        for await(const file of files){
            body = await fileOperation.moveFile(bucket, file.Key)
        }
        return {
            statusCode: 200,
            body
        }
    } catch(error){
        return {
            statusCode: 500,
            body:error
        }
    }
}
