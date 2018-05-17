# An AWS S3 File System

## How to Use It

Just include it as an npm module, and run:

Then you do:

`import S3FS from 's3-fs'`.

Then you create an instance of the S3 file system:

`let s3fs = new S3FS(accessKey, secretKey, region, bucket, baseFolder);`

The params are:

* `accessKey` - the public part of your AWS key.
* `secretKey` - the secret part of your AWS key. They both should haver permission to access the bucket you want to access.
* `region` - the AWS region, like 'us-west-2'.
* `bucket` - the name of the bucket you want to access.
* `baseFolder` - this will be the root folder, so that when your path is just `/`, it will mean this folder.

Once you've constructed it, you have a number of options:

* `s3fs.parent(path)` - It returns the parent of the given path. If you are at the root, it will return the root.
* `s3fs.name(path)` - It returns the filename of the object at the path.
* `s3fs.exists(path)` - It returns a promise that resolves with true if there is a file at that path.
* `s3fs.list(path, marker)` - It lists files within `path`. It returns a promise that resolves object `{ folders: [], files: [], marker }`. `folders` is the list of folders in the path, `files` is the list of files in the path, and `marker` is a value that can be passed back in to the list function to get more items until it becomes `null`. If the path is invalid, the promise rejects with an error message.
* `s3fs.createFile(parentFolderPath, name, type)` - It creates a file within `parentFolderPath` named `name` with the mime-type `type`. It returns a promise that resolves with the newly created file path or rejects with an error message.
* `s3fs.createFolder(parentFolderPath, name)` - It creates a folder within `parentFolderPath` named `name`. It returns a promise that resolves with the newly created folder path or rejects with an error message.
* `s3fs.deletePath(path)` - It deletes a file or folder at `path`. If it is a folder and has folders or files within it, it will not delete it. It returns a promise that resolves with true if the file or folder was deleted or rejects with an error message if the path does not exist.
* `s3fs.load(path, binary)` - It loads the contents of the file `path`. If `binary` is true, it loads it in binary mode. Otherwise it loads it in text mode. It returns a promise that resolves with the loaded data, or rejects with an error message.
* `s3fs.save(path, data)` - It saves the `data` to the `path`. It returns a promise that resolves with nothing, or rejects with an error message.