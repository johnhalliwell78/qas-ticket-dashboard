import * as path from "path";
import * as nodeDir from "node-dir";

let fs: any = require("fs-extra");

// reference: https://www.gregjs.com/javascript/2016/checking-whether-a-file-directory-exists-without-using-fs-exists/
/**
 * checks whether a path specified by filePath is a file
 * @param filePath path to the file
 */
export async function isFile(filePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve: any, reject: any) => {
    return fs.lstat(filePath, (err: any, stats: any) => {
      if (err !== null && err !== undefined) {
        resolve(false);
      } else {
        resolve(stats.isFile());
      }
    });
  });
}

/**
 * checks whether a file specified by filePath is existed
 * @param filePath absolute path to the file
 */
export async function exists(filePath: string): Promise<boolean> {
  return await isFile(filePath);
}

/**
 * read all text of a file specified by filePath
 * @param filePath path to the text file
 */
export async function readAllText(filePath: string): Promise<string> {
  return new Promise<string>((resolve: any, reject: any) => {
    try {
      fs.readFile(filePath, "utf8", (err: any, buffer: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * get all file paths inside a directory synchronously
 * @param dir path of the directory
 * @param recursive specify whether the function should load files in subdirectories recursively, default is true
 */
export function getFilesSync(dir: string, recursive: boolean = true): Array<string> {
  var files: Array<string> = [];
  fs.readdirSync(dir).forEach((file: string) => {
    var subpath: string = path.join(dir, file);
    if (fs.lstatSync(subpath).isFile()) {
      files.push(subpath);
    } else if (recursive === true) {
      files = files.concat(getFilesSync(subpath, recursive));
    }
  });
  return files;
}

/**
 * get all file paths inside a directory recursively and asynchronously
 * @param dir path of the directory
 */
export async function getFiles(dir: string): Promise<string[]> {
  return new Promise<string[]>((resolve: any, reject: any) => {
    nodeDir.files(dir, (err: any, filePaths: string[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePaths);
      }
    });
  });
}

export async function writeFile(p: string, data: any): Promise<boolean> {
  return new Promise<boolean>((resolve: any, reject: any) => {
    fs.writeFile(p, data, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

export async function readTextFile(filePath: string): Promise<string> {
  return new Promise<string>((resolve: any, reject: any) => {
    fs.readFile(filePath, "utf8", (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function saveFile(filePath: string, data: any): Promise<boolean> {
  return new Promise<boolean>((resolve: any, reject: any) => {
    let folder: string = path.dirname(filePath);
    return fs.ensureDir(folder)
      .then(() => {
        fs.writeFile(filePath, data, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

export async function deleteFile(fileAbsolutePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve: any, reject: any) => {
    let filePath: string = path.join(fileAbsolutePath);
    fs.unlink(filePath, (err: any) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
