import AWS from 'aws-sdk'

// A simplified interface for the AWS S3 file system.
// All folders end in '/', except for the root, which is ''.
class S3 {
	// Constructs the AWS S3 file system.
	constructor(accessKey, secretKey, region, bucket) {
		this._s3 = null;
		this._bucket = bucket;
		AWS.config.update({
			accessKeyId: accessKey,
			secretAccessKey: secretKey,
			region: region
		});
		this._s3 = new AWS.S3();
	}

	// Returns the parent folder's path.
	parent(path) {
		if (path.endsWith('/')) {
			return path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
		}
		else {
			return path.substring(0, path.lastIndexOf('/') + 1);
		}
	}

	// Returns the name of the object at the path.
	name(path) {
		if (path.endsWith('/')) {
			return path.substring(path.lastIndexOf('/', path.length - 2) + 1, path.length - 1);
		}
		else {
			return path.substring(path.lastIndexOf('/') + 1);
		}
	}

	// Determines if an entry exists.
	// Returns a promise taking a boolean whether the entry exists.
	exists(path) {
		let params = {
			Bucket: this._bucket,
			Key: path,
		};
		return new Promise((resolve, reject) => {
			this._s3.headObject(params, (err, data) => {
				resolve(err === null);
			});
		});
	}

	// Lists the child folders and files in this folder, up to 1000 objects.
	// If the marker is not null, use the marker in subsequent calls to get more objects.
	// Returns a promise that takes an object { folders: [], files: [], marker }, of the entries that are the child names of this folder.
	list(path, marker) {
		let params = {
			Bucket: this._bucket,
			Prefix: path,
			Delimiter: '/'
		};
		return new Promise((resolve, reject) => {
			this._s3.listObjectsV2(params, (err, data) => {
				let children = {
					folders: [],
					files: [],
					marker: null
				};
				for (let i in data.CommonPrefixes) {
					let prefix = data.CommonPrefixes[i].Prefix;
					if (prefix == path) {
						continue;
					}
					let name = this.name(prefix);
					children.folders.push(name);
				}
				for (let i in data.Contents) {
					let key = data.Contents[i].Key;
					let name = this.name(key);
					children.files.push(name);
				}
				if (data.IsTrucated) {
					children.marker = data.NextMarker;
				}
				resolve(children);
			});
		});
	}

	// Creates a child file of the given name and type.
	// Returns a promise that takes the newly created file path.
	createFile(parentPath, name, type) {
		let params = {
			Bucket: this._bucket,
			Key: parentPath + name,
			ContentType: type
		};
		return new Promise((resolve, reject) => {
			this._s3.putObject(params, (err, data) => {
				resolve(parentPath + name);
			});
		});
	}

	// Creates a child folder of the given name.
	// Returns a promise that takes the newly created folder path..
	createFolder(parentPath, name) {
		let params = {
			Bucket: this._bucket,
			Key: parentPath + name
		};
		return new Promise((resolve, reject) => {
			this._s3.putObject(params, (err, data) => {
				resolve(parentPath + name);
			});
		});
	}

	// Deletes a object at the path.
	// If it is a folder, it only deletes it if there are no sub-folders or sub-files.
	// Returns a promise that takes boolean if it was deleted.
	delete(path) {
		if (path.endsWith('/')) {
			let params = {
				Bucket: this._bucket,
				Prefix: path
			};
			return new Promise((resolve, reject) => {
				this._s3.listObjectsV2(params, (err, data) => {
					if (data.CommonPrefixes.length == 0 && data.Contents.length == 1) { // 1 is for the path itself
						let params = {
							Bucket: this._bucket,
							Key: path
						};
						this._s3.deleteObject(params, function (err, data) {
							resolve(true);
						});
					}
					else {
						resolve(false);
					}
				});
			});
		}
		else {
			let params = {
				Bucket: this._bucket,
				Key: path
			};
			return new Promise((resolve, reject) => {
				this._s3.deleteObject(params, (err, data) => {
					resolve(true);
				});
			});
		}
	}

	// Gets the contents of the file at the path.
	// Returns a promise that takes the data.
	load(path) {
		let params = {
			Bucket: this._bucket,
			Key: path
		};
		return new Promise((resolve, reject) => {
			this._s3.getObject(params, (err, data) => {
				resolve(new TextDecoder("utf-8").decode(data.Body));
			});
		});
	}

	// Saves the data to the file at the path.
	// Returns a promise that takes nothing.
	save(path, data) {
		let params = {
			Bucket: this._bucket,
			Key: path,
			Body: data
		};
		return new Promise((resolve, reject) => {
			this._s3.putObject(params, (err, data) => {
				resolve();
			});
		});
	}
}