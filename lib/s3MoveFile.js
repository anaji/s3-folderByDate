const AWS = require('aws-sdk')
const S3 = new AWS.S3()


const s3MoveFile = class {
  async moveFile (bucket, key) {
    let date = this._extractDateFromKey(key)
    let file = this._extractFileName(key)
    let newKey = `${date.year}/${date.month}/${date.day}/${file}`
    await this._moveS3Object(bucket, file, newKey)
    await this._deleteS3SourceObject(bucket,key)
    return this._getSignedUrl(bucket, newKey)
  }

  async getAllFilesInRoot(params){
    return (await S3.listObjectsV2(params).promise()).Contents.filter( element => {
      return this._isRootBucket(element.Key)
    })
  }

  _extractDateFromKey (key) {
    let regex = /[0-9]{4}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])/g
    let found = key.match(regex).toString()
    let year = found.substring(0, 4)
    let month = found.substring(4, 6)
    let day = found.substring(6, 8)
    return {year, month, day}
  }

  _extractFileName (key) {
    //let str = key.split('-')
    //return `${str[1]}_${str[2]}`
    return key
  }

  _moveS3Object (bucket, key, newKey) {
    let lastIndex=key.lastIndexOf("/");
    let keyFolder = key.slice(0,lastIndex+1);
    return S3.copyObject({
      CopySource: bucket+'/'+key,
      Bucket: bucket,
      Key: `${newKey}`,
    }).promise()
  }

  _deleteS3SourceObject(Bucket,Key){
    return S3.deleteObject({
      Bucket,
      Key
     }).promise()
  }

  async _getSignedUrl (bucket, key) {
    const params = { Bucket: bucket, Key: key }
    return S3.getSignedUrlPromise('getObject', params)
  }

  _isRootBucket(key){
   return (key.match(/\//g) || []).length == 0
  }
}

module.exports = new s3MoveFile()
