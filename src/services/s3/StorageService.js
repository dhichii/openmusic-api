const AWS = require('aws-sdk');
const config = require('../../util/config');

class StorageService {
  constructor() {
    this._S3 = new AWS.S3();
  }

  writeFile(file, meta) {
    const params = {
      Bucket: config.s3.bucketName,
      Key: +new Date() + meta.filename,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    };

    return new Promise((resolve, reject) => {
      this._S3.upload(params, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data.Location);
      });
    });
  }

  deleteFile(fileName) {
    const params = {
      Bucket: config.s3.bucketName,
      Key: fileName,
    };

    return new Promise((reject) => {
      this._S3.deleteObject(params, (error) => {
        if (error) {
          return reject(error);
        }
      });
    });
  }
}

module.exports = StorageService;
