const gulp = require("gulp"),
  del = require("del"),
  tsc = require("gulp-typescript"),
  sourcemaps = require("gulp-sourcemaps"),
  tsProject = tsc.createProject("tsconfig.json"),
  gulpTslint = require("gulp-tslint"),
  runSequence = require("run-sequence"),
  nodemon = require("nodemon"),
  gnodemon = require("gulp-nodemon"),
  gmocha = require("gulp-mocha"),
  gulpFilter = require("gulp-filter");

let fs = require("fs");
let path = require("path");
let rename = require("gulp-rename");
let archiver = require("archiver");
let merge = require("merge-stream");
let appConfig = require("./app.config.json");
let spawn = require("child_process").spawn;
let childProcess = require('child_process');

const env = process.env.NODE_ENV || "development";
const distFolder = "dist";
const APP_VERSION = appConfig.version;

const packageFolder = path.resolve("../packages");
var package = "ec2"; //"ec2" or "op"

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see http://stackoverflow.com/a/42505874/3027390
 */
function rimraf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function (entry) {
      var entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(dir_path);
  }
}

gulp.task("install-node", function (cb) {
  let destFolder = path.join(packageFolder, package, env);
  spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["install", "--production"], { cwd: destFolder, stdio: "inherit" })
    .on("close", cb);
});

gulp.task("getCommit", function (callback) {
  //Get last commit info: $git log -1 --pretty=format:"%h, %H, %s, %f, %b, %at, %ct, %an, %ae, %cn, %ce, %N" 
  //Get branch          : $git rev-parse --abbrev-ref HEAD
  let commitInfoCmd = `git log -1 --pretty=format:"%h,%H,%s,%f,%b,%at,%ct,%an,%ae,%cn,%ce,%N"`;
  let currentBranchCmd = `git rev-parse --abbrev-ref HEAD`;
  childProcess.exec(commitInfoCmd, {}, function (err, stdout, stderr) {
    if (stdout === "") {
      console.log("Cannnot execute git command");
      return;
    }

    if (stderr) {
      console.log(`Execute git command error: ${stderr}`);
      return;
    }

    let infos = stdout.split(",");
    let commitInfo = {
      shortHash: infos[0],
      hash: infos[1],
      revision: infos[0].substr(0, 7),
      subject: infos[2],
      sanitizedSubject: infos[3],
      body: infos[4],
      authoredOn: infos[5],
      committedOn: infos[6],
      author: {
        name: infos[7],
        email: infos[8],
      },
      committer: {
        name: infos[9],
        email: infos[10]
      },
      notes: infos[11],
      branch: ""
    }

    childProcess.exec(currentBranchCmd, {}, function (err, stdout, stderr) {
      if (stdout && !stderr) {
        commitInfo.branch = stdout.trim();
      }

      let destFile = path.join(packageFolder, package, env, "commit.json");
      let json = JSON.stringify(commitInfo, null, 2);
      fs.writeFileSync(destFile, json, "utf8");
      callback();
    });
  });
});

gulp.task("zip", function (cb) {

  var zipDir = path.join(packageFolder, package, env);
  var isWin = /^win/.test(process.platform);
  var os = "";
  if (env === "onpremise") {
    os = isWin ? "-windows-x64" : "-linux-x64";
  }

  var outputPath = path.join(packageFolder, package, `qas-ticket-dashboard-${APP_VERSION}${os}.zip`);
  console.log(outputPath);
  if (env === "onpremise" && !isWin) {
    //zip on linux, must install zip package: sudo apt-get install zip
    //
    spawn("zip", ["-r", outputPath, "."], { cwd: zipDir, stdio: "inherit" })
      .on("close", cb);
  } else {
    // create a file to stream archive data to.
    var output = fs.createWriteStream(outputPath);
    var archive = archiver("zip");

    // listen for all archive data to be written
    output.on("close", function () {
      console.log(archive.pointer() + " total bytes");
      console.log("archiver has been finalized and the output file descriptor has closed.");
      cb();
    });

    // good practice to catch this error explicitly
    archive.on("error", function (err) {
      cb(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.directory(`${zipDir}`, false);
    archive.finalize();
  }
});

/**
 * Remove build directory.
 */
gulp.task("clean", (cb) => {
  return del([distFolder], cb);
});

var copyClient = function () {
  if (fs.existsSync(path.resolve("../client/dist"))) {
    return gulp.src(["../client/dist/**/*"], { dot: true })
      .pipe(gulp.dest(`${distFolder}/client`))
  }
};

var copyMigrations = function () {
  if (fs.existsSync(path.resolve("../migrations/dist"))) {
    let destFolder = path.join(packageFolder, package, env, "migrations", "dist");
    return gulp.src(["../migrations/dist/**/*"], { dot: true })
      .pipe(gulp.dest(destFolder))
  }
};

var copySwagger = function () {
  return gulp.src(["./app/swagger-ui/**/*"], { dot: true })
    .pipe(gulp.dest(`${distFolder}/client/api-docs`))
};

var copyApiDocs = function () {
  return gulp.src(["./app/api-docs/**/*"], { dot: true })
    .pipe(gulp.dest(`${distFolder}/client/api-docs/api-docs`))
};

/**
 * Build Express server
 */
var buildServer = function () {
  gulp.src(["./app/www"])
    .pipe(gulp.dest(`${distFolder}`));
  var tsProject = tsc.createProject("tsconfig.json");
  var tsResult = gulp.src("app/**/*.ts")
    .pipe(gulpFilter(["app/**/*.ts", "!app/**/*.spec.ts"]))
    .pipe(sourcemaps.init())
    .pipe(tsProject());
  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(distFolder));
};

var buildServerForTest = function () {
  gulp.src(["./app/www"])
    .pipe(gulp.dest(`${distFolder}`));
  var tsProject = tsc.createProject("tsconfig.json");
  var tsResult = gulp.src("app/**/*.ts")
    .pipe(gulpFilter(["app/**/*.ts"]))
    .pipe(sourcemaps.init())
    .pipe(tsProject());
  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(distFolder));
};

gulp.task("copy:client", () => {
  return copyClient();
});

gulp.task("copy:migrations", () => {
  return copyMigrations();
});

gulp.task("copy:swagger-ui", () => {
  return copySwagger();
});

gulp.task("copy:api-docs", () => {
  return copyApiDocs();
});

gulp.task("build:server", () => {
  return buildServer();
});

gulp.task("build:server-test", () => {
  return buildServerForTest();
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task("tslint", () => {
  var config = { formatter: "verbose" };
  return gulp.src([
    "app/**/*.ts"
  ])
    .pipe(gulpFilter(["app/**/*.ts", "!app/**/*.spec.ts"]))
    .pipe(gulpTslint(config))
    .pipe(gulpTslint.report({
      emitError: true,
      summarizeFailureOutput: true
    }));
});

/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
gulp.task("compile:server", ["tslint"], () => {
  let tsResult = gulp.src("app/**/*.ts")
    .pipe(gulpFilter(["app/**/*.ts", "!app/**/*.spec.ts"]))
    .pipe(tsProject());
  return tsResult
    .pipe(gulp.dest(distFolder));
});

/**
 * Copy server resources
 */
gulp.task("copy:server:resources", () => {
  let copyTasks = [
    gulp.src(["app/assets/**/**/"])
      .pipe(gulp.dest(`${distFolder}/assets`)),
    gulp.src(["app/ssl/*"])
      .pipe(gulp.dest(`${distFolder}/ssl`)),
    gulp.src(["app/views/**/**"])
      .pipe(gulp.dest(`${distFolder}/views`)),
    gulp.src(["app/configs/*.json"])
      .pipe(gulp.dest(`${distFolder}/configs`))
  ];

  return merge(...copyTasks);
});

gulp.task("package-ec2", function (callback) {
  package = "ec2";
  runSequence("build", "package", "getCommit", "zip", "clean", callback);
});

gulp.task("package-op", function (callback) {
  package = "op";
  runSequence("build", "package", "copy:migrations", "op:update:configs", "getCommit", "install-node", "zip", "clean", callback);
});

gulp.task("package", () => {
  if (!fs.existsSync(path.resolve("dist"))) {
    throw Error("Server /dist is empty. Run `npm run build` before running packaging tasks.");
  }

  let destFolder = path.join(packageFolder, package, env);
  if (fs.existsSync(destFolder)) {
    rimraf(destFolder);
  }

  var destDistFolder = path.join(`${destFolder}`, "dist");
  let tasks = [];
  tasks.push(gulp.src(["./dist/**/*"], { dot: true })
    .pipe(gulp.dest(`${destDistFolder}`)));

  //tasks.push(gulp.src(["./.ebextensions/**/*"])
  //  .pipe(gulp.dest(`${destFolder}/.ebextensions`)));

  tasks.push(gulp.src(["./package.json", "./app.config.json", "./npm-shrinkwrap.json", "./pm2.json"])
    .pipe(gulp.dest(destFolder)));

  return merge(...tasks);
});

gulp.task("op:update:configs", () => {
  // turn off on_demand
  let appConfigPath = path.join(packageFolder, package, env, "app.config.json");
  if (fs.existsSync(appConfigPath)) {
    let appConfig = require(appConfigPath);
    appConfig.on_demand = false;
    fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 4), "utf8");
  }

  // empty db.config.json
  let dbConfigPath = path.join(packageFolder, package, env, "dist", "configs", "db.config.json");
  if (fs.existsSync(dbConfigPath)) {
    let dbConfig = require(dbConfigPath);
    dbConfig = {};
    fs.writeFileSync(dbConfigPath, JSON.stringify(dbConfig, null, 4), "utf8");
  }

  // remove migrations config files
  let migraConfigDir = path.join(packageFolder, package, env, "migrations", "dist", "app", "configs");
  if (fs.existsSync(migraConfigDir)) {
    rimraf(migraConfigDir);
  }
});

/**
 * Start the express server with nodemon
 */
gulp.task("nodemon", function () {
  // diable watch because we already use gulp.watch: https://github.com/remy/nodemon/issues/516
  gnodemon({
    script: "dist/www",
    watch: false,
    env: { "NODE_ENV": "development" }
  });
});

gulp.task("restart:nodemon", function () {
  nodemon.emit("restart");
});

/**
 * Start unit test
 */
gulp.task("mocha", function () {
  return gulp.src([`${distFolder}/**/*.spec.js`], { read: false })
    .pipe(gmocha({ reporter: "list" }))
    .once("error", () => {
      process.exit(1);
    })
    .once("end", () => {
      process.exit();
    })
});

gulp.task("build:test", function (callback) {
  runSequence("clean", "tslint", "build:server-test", "copy:server:resources", callback);
});

gulp.task("build", function (callback) {
  runSequence("clean", "tslint", "build:server", "copy:client", "copy:swagger-ui", "copy:api-docs", "copy:server:resources", callback);
});

gulp.task("default", function () {
  runSequence("clean", "build:server", "copy:server:resources", "start");
});


gulp.task("watch", function () {
  var watchForChangesThenRebuild = function (dirs, throttle, cb) {
    var rebuildTimeout = null;
    gulp.watch(dirs, (e) => {
      // if changes happen frequently, e.g. between 3 seconds, remove the scheduled timer
      if (rebuildTimeout != null) {
        clearTimeout(rebuildTimeout);
      }
      // then re-schedule it again
      rebuildTimeout = setTimeout(function () {
        cb();
      }, throttle * 1000);
    });
  };

  const rebuildInSeconds = 3;
  // watch for changes in server/app/ then schedule a rebuild after [rebuildInSeconds] seconds of changes
  watchForChangesThenRebuild(["app/**/*"], rebuildInSeconds, () => {
    runSequence("tslint", "build:server", "copy:api-docs", "copy:server:resources", "restart:nodemon");
  });

  // watch for changes in client/src/ then schedule a rebuild after [rebuildInSeconds] seconds of changes
  watchForChangesThenRebuild(["../client/src/**/*"], rebuildInSeconds, () => {
    spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["run", "build"], { cwd: path.resolve("../client"), stdio: "inherit" })
      .on("close", () => {
        runSequence("copy:client", "copy:swagger-ui", "copy:api-docs", "restart:nodemon");
      });
  });
});

gulp.task("start", function () {
  runSequence("nodemon", "watch");
});
