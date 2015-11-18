// 流程：
// *. document.body插入隐藏的flash
// *. document.body插入隐藏的表单
// *. new CosUploader()获得一个cosUploader对象
// *. 调用cosUploader.selectFile() 选择文件
// *. 调用cosUploader.upload() 方法上传文件
// *. 调用cosUploader.getHash() 方法获得sha1

define(['jquery', 'db', 'swfobject'], function ($, DB) {
    var isDebug = false, // 是否debug
        swfPath = '/swf/cosuploader.swf', // flash文件路径
        swfElementId = 'js-cosuploader-swf', // flash元素容器id
        formElementId = 'js-cosuploader-form', // 表单id
        inputElementId = 'js-cosuploader-input', // input id
        appID = '10000074', // cos系统appid
        bucketName = 'sng_edu_agency_files', // cos系统bucketname
        directory = '', // 默认上传目录，此处为空。如设置需要加反斜杠/
        isBrowserSupport = true, // 浏览器是否支持本组件
        fileSlice = null, // 文件切片原型方法
        // 错误码
        ERROR_NOT_SUPPORT = '不支持的浏览器，请使用chrome/firefox/ie10',
        ERROR_READ_FILE = '文件读取错误',
        ERROR_GET_SIGN = '获取签名失败',
        ERROR_FILE_NAME = '文件名非法',
        ERROR_STOPPED = '操作已终止',
        initSwf = function () { // 全局初始化swf，只执行一次
            if (!swfobject.getObjectById(swfElementId)) {
                $(document.body).append('<div id="' + swfElementId + '" style="display:none;"></div>');
                swfobject.embedSWF(swfPath, swfElementId, "0", "0", "10.1.0", "expressInstall.swf");
            }
        },
        initForm = function () { // 全局初始化表单，只执行一次
            var $form = $('#' + formElementId);
            if ($form.length < 1) {
                var str = '<form enctype="multipart/form-data" id="' + formElementId + '" method="post" style="display:none;"><input type="file" id="' + inputElementId + '" name="filecontent"></form>';
                $(document.body).append(str);
                return $('#' + formElementId);
            } else {
                return $form;
            }
        },
        getGlobalSwfObject = function () { // 获取swf对象
            return swfobject.getObjectById(swfElementId);
        },
        readFile = function (file, start, end) { // 读取文件数据
            return fileSlice.call(file, start, end);
        },
        // 异步流处理
        // 支持Object方式传入多个任务，统一callback返回，只要有一个任务失败则立即中止流程。
        // 类似Nodejs的回调，回调参数为(err,results)，每个任务的执行结果保存在results对象。
        async = function (obj, callback, scope) {
            var tasks = []; // 待执行任务列表
            var results = {}; // 执行任务结果
            var errMsg = null; // 出错信息
            scope = scope || {};
            if (Object.prototype.toString.call(obj) === '[object Array]') {
                for (var i = 0, len = obj.length; i < len; i++) {
                    tasks.push(i);
                }
            } else {
                for (var key in obj) {
                    tasks.push(key);
                }
            }
            // 执行一个任务
            var runOneTask = function (key) {
                obj[key].call(scope, function (err, result) {
                    if (err) { // 任务执行出错
                        errMsg = err;
                        done();
                    } else { // 任务执行成功
                        results[key] = result;
                        tasks.shift();
                        checkTask();
                    }
                });
            };
            // 检测并执行一个任务
            var checkTask = function () {
                if (tasks.length > 0) {
                    runOneTask(tasks[0]);
                } else {
                    done();
                }
            };
            // 所有任务执行成功
            var done = function () {
                if (errMsg) {
                    return callback.call(scope, errMsg);
                } else {
                    return callback.call(scope, null, results);
                }
            };
            checkTask();
        },
        checkBrowser = function () { // 检测浏览器是否支持h5文件上传
            if (!("FileReader" in window)) return false;
            if (!("File" in window)) return false;
            if (!File.prototype) return false;
            fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
            if (!fileSlice) return false;
            return true;
        };

    isBrowserSupport = checkBrowser();

    // 上传
    var CosUploader = function (options) {
        var opts = {
                blockSize: 1024 * 1024 * 2, // 分片大小2M
                delay: 0, // 每次分片读取的间隔，单位ms。防止ui卡死
                currentChunk: 0, // 当前分片
                onStatusChange: function () {},
                aid: '' // 机构id
            },
            self = this;
        $.extend(opts, options);
        this.opts = opts;
        this.delay = opts.delay;
        this.blockSize = opts.blockSize;

        // 初始化swf和form。其实就是在body中插入html。
        initSwf(); // flash加载需要异步定时判断是否加载完成
        initForm();
        this.$input = $('#' + inputElementId);
        this.$input.after(this.$input.clone().val(''));
        this.$input.remove();
        this.$input = $('#' + inputElementId);
        this.$input.on('change', function () {
            var ele = $(this)[0];
            self.isStopped = true;
            self.file = ele.files.length > 0 ? ele.files[0] : '';
            self.fileSize = self.file ? self.file.size : 0;
            self.fileSizeText = self.file ? self.formatSize(self.fileSize) : '未选择文件';
            self.fileName = self.file ? self.file.name : '';
            self.opts.onStatusChange.call(self, 'filechange', self.file);
            isDebug && console.log('select file:', self.fileName, self.fileSize);
        });
    };

    CosUploader.prototype = {
        // 上传状态，分为：filechange/initing/uploading/complete/error
        // 对应：初始化、文件检测、上传中、上传完成、出错
        status: 'initing', // 上传状态
        swfobject: null, // swf
        file: null, // 文件对象
        fileSize: 0,
        fileName: '',
        blockSize: 0, // 分片大小，用于计算sha1
        delay: 0, // 每次读取分片的间隔，防止计算sha1时ui卡死
        sha: null, // sha1值
        isStopped: false, // 是否暂停

        isBrowserSupport: isBrowserSupport, // 浏览器是否支持

        uploadStartTime: 0, // 上传开始时间，时间戳，ms
        uploadTime: 0, // 上传已经用时，单位s
        uploadSize: 0, // 已上传大小
        speed: 0, // 上传速度，字节/s
        remainTime: 0, // 预计剩余时间，单位s
        speedText: '', // 添加了速度单位的上传速度
        remainTimeText: '', // 转换为时分秒的剩余时间
        uploadTimeText: '', // 转换为时分秒的已上传时间
        fileSizeText: '', // 转换为mb/kb等单位的文件大小
        uploadSizeText: '', // 已上传大小

        sign: '', // 签名
        uploadFolder: '', // 上传的文件夹
        cosUrl: 'http://web.file.myqcloud.com/files/v1/' + appID + '/' + bucketName + '/' + directory,
        session: '', // 断点续传用到的session id
        startOffset: 0, // 断点续传开始的位移
        offset: 0, // 当前正在上传分片的起始位移
        slice_size: '', // 断点续传分片的大小
        access_url: '', // 上传成功后的文件下载url
        url: '', // 操作文件的url
        resource_path: '', // 上传成功后的资源路径
        _checkSwfTimes: 0,
        // 弹出选择文件对话框
        selectFile: function () {
            this.$input.click();
            return this;
        },
        // 取消操作
        cancel: function () {
            this.isStopped = true;
            this.opts.onStatusChange.call(this, 'error', ERROR_STOPPED);
            return this;
        },
        // 获取sign
        getSign: function (callback) {
            if (this.isStopped) return callback(ERROR_STOPPED);
            if (this.sign) return callback(null, this.sign);
            var api = DB.httpMethod({
                url: '/cgi-bin/file/getSignature',
                type: 'GET'
            });
            var self = this;
            api({
                param: {
                    aid: this.opts.aid,
                    fileName: this.fileName
                },
                isUseModal: true,
                succ: function (data) {
                    data = data || {};
                    data.result = data.result || {};
                    var sign = data.result.sign;
                    if (!sign) {
                        callback(ERROR_GET_SIGN);
                    }
                    self.sign = sign;
                    callback(null, sign);
                },
                err: function (result) {
                    if (result.retcode === 106442) return callback('文件名不合法');
                    if (result.retcode === 1070347) return callback('上传文件个数已达上限');
                    callback(ERROR_GET_SIGN);
                    // return true;
                }
            });
            return this;
        },
        // 上传文件
        upload: function (callback) {
            var self = this;
            this.isStopped = false;
            this.session = '';
            this.offset = 0;
            this.sha = '';

            this.opts.onStatusChange.call(this, 'initing');
            this.async({
                sign: this.getSign, // 获取签名
                hash: this.getHash, // 计算文件sha11
                folder: function (cb) { // 创建一个以sha1+时间戳命名的目录存放文件
                    this.uploadFolder = this.sha + new Date().getTime() + '/';
                    this._createFolder(cb);
                },
                firstBlock: this._uploadFirstBlock, // 上传第一个分片，根据返回信息判断是否断点续传、秒传
                nextBlock: this._uploadNextBlock // 上传其余分片
            }, function (err, result) {
                if (!err && this.isStopped) err = ERROR_STOPPED;
                if (err) {
                    this.opts.onStatusChange.call(this, 'error', err);
                    return callback(err);
                }
                this.opts.onStatusChange.call(this, 'complete');
                callback(err, this.access_url); // 直接返回最终下载url
            });
            return this;
        },
        // 获取hash，传入nodejs风格回调。当错误时，返回错误的分片数
        getHash: function (callback) {
            if (this.isStopped) return callback(ERROR_STOPPED);
            if (!isBrowserSupport) return callback(ERROR_NOT_SUPPORT);
            if (this.sha) return callback(null, this.sha);
            var self = this,
                startBlocks = 1,
                totalBlocks = Math.ceil(this.fileSize / this.blockSize),
                fileReader = new FileReader(),
                readOneBlock = function () {
                    var start = 0,
                        end = 0;
                    start = (startBlocks - 1) * self.blockSize;
                    end = start + self.blockSize;
                    end = (end > self.fileSize) ? self.fileSize : end;
                    fileReader.readAsDataURL(readFile(self.file, start, end));
                    startBlocks++;
                };
            fileReader.onload = function (e) {
                if (self.isStopped) return callback(ERROR_STOPPED);
                self.swfobject.ftn_sign_update_dataurl(e.target.result);
                if (startBlocks > totalBlocks) {
                    self.sha = self.swfobject.ftn_sha1_result();
                    return callback(null, self.sha);
                }
                setTimeout(readOneBlock, self.delay);
            };
            fileReader.onerror = function (e) {
                callback(ERROR_READ_FILE);
            };
            this._checkSwfLoadComplete(readOneBlock);
            return this;
        },
        // 执行一组方法，统一返回回调。支持object/array方式
        async: function (fnList, callback) {
            async(fnList, callback, this);
            return this;
        },
        // 计算上传进度
        countProgress: function () {
            // 已上传时间
            this.uploadTime = Math.ceil((new Date().getTime() - this.uploadStartTime) / 1000);
            // 至少为1秒，否则计算的速度和剩余时间会出错
            if (this.uploadTime < 1) this.uploadTime = 1;
            this.uploadSize = this.offset;
            var uploadSize = this.offset - this.startOffset; // 已上传大小
            this.speed = uploadSize / this.uploadTime; // 上传速度
            if (this.speed === 0) this.speed = 1;
            this.remainTime = Math.round((this.fileSize - this.offset) / this.speed);
            this.speedText = this.formatSpeed(this.speed);
            this.uploadSizeText = this.formatSize(this.uploadSize);

            this.remainTimeText = this.formatTime(this.remainTime);
            this.uploadTimeText = this.formatTime(this.uploadTime);

        },
        formatTime: function (seconds) {
            var hour = 0,
                min = 0,
                sec = 0,
                res = (seconds % 60) + '秒';
            if (seconds > 60) {
                res = (Math.floor(seconds / 60) % 60) + '分' + res;
            }
            if (seconds > 3600) {
                res = Math.floor(seconds / 3600) + '时' + res;
            }
            return res;
        },
        formatSize: function (size) { // 最小单位KB
            // 大于1M
            if (size > 1024 * 1024) {
                return (size / 1024 / 1024).toFixed(1) + 'MB';
            }
            var kb = (size / 1024).toFixed(1) + 'KB';
            if (kb === '0.0KB') return '0.1KB';
            return kb;
        },
        // 格式化速度
        formatSpeed: function (speed) {
            return this.formatSize(speed) + '/s';
        },
        // 指定状态变化时的回调
        onStatusChange: function (fn) {
            this.opts.onStatusChange = fn;
            return this;
        },
        // 上传下一个分片，直到结束
        _uploadNextBlock: function (callback) {
            if (this.isStopped) return callback(ERROR_STOPPED);
            this.countProgress(); // 更新进度
            this.opts.onStatusChange.call(this, 'uploading');
            if (this.access_url) return callback(null, this.access_url);
            var self = this,
                start = this.offset,
                end = start + this.slice_size;
            isDebug && console.log('_uploadNextBlock', 'offset:' + this.offset, 'slice_size:' + this.slice_size, 'start:' + start, 'end:' + end);
            this._cosAjax({
                url: this.cosUrl + this.uploadFolder + this.fileName,
                data: {
                    op: 'upload_slice',
                    filecontent: readFile(this.file, start, end),
                    session: this.session,
                    offset: this.offset
                }
            }, function (err, data) {
                if (err) return callback('上传服务故障，请稍后重试！');
                self.session = data.session; // session id
                self.offset = end; // 位移
                self.access_url = data.access_url; // 最终url
                self.url = data.url;
                self.resource_path = data.resource_path;

                self._uploadNextBlock(callback);
            });
            return this;
        },
        // 分片上传，第一片
        _uploadFirstBlock: function (callback) {
            if (this.isStopped) return callback(ERROR_STOPPED);
            var self = this;
            isDebug && console.log('_uploadFirstBlock:', 'size:' + this.fileSize, 'sha:' + this.sha);
            this._cosAjax({
                url: this.cosUrl + this.uploadFolder + this.fileName,
                data: {
                    op: 'upload_slice',
                    filesize: this.fileSize,
                    sha: this.sha,
                    session: this.session
                }
            }, function (err, data) {
                if (err) return callback('上传服务故障，请稍后重试！');
                self.uploadStartTime = new Date().getTime(); // 上传起始时间

                self.session = data.session; // session id
                self.offset = self.startOffset = data.offset; // 位移
                self.slice_size = data.slice_size; // 分片大小
                self.access_url = data.access_url; // 最终url
                self.url = data.url;
                self.resource_path = data.resource_path;
                self.countProgress();
                callback(err, data);
            });
            return this;
        },
        _deleteFile: function () { // 删除文件和目录

        },
        // ajax请求cos系统，利用表单跳转。
        _cosAjax: function (options, callback) {
            options = options || {};
            options.data = options.data || {};
            var formData = new FormData();
            for (var key in options.data) {
                formData.append(key, options.data[key]);
            }
            $.ajax({
                url: options.url + '?sign=' + encodeURIComponent(this.sign),
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function (data) {
                    data = data || {};
                    data.data = data.data || {};
                    if (data.code !== 0) {
                        return callback(data.message);
                    }
                    callback(null, data.data);
                },
                error: function (xhr, status, error) {
                    isDebug && console.log('ajax request failed.', xhr, status, error);
                    callback(error);
                }
            });
            return this;
        },
        // 定时轮询flash是否加载完成
        // swf加载完成后才能启动下载，否则无法调用swf计算文件的sha1
        _checkSwfLoadComplete: function (callback) {
            if (this.swfobject) return callback(null); // 已加载完成
            var self = this;
            this.swfobject = getGlobalSwfObject();
            this._checkSwfTimes++;
            if (this._checkSwfTimes > 100) { // 30s都没有加载成功，shit!
                console.error('load swf failed,tell me why?');
                return callback('load swf failed.');
            }
            setTimeout(function () {
                self._checkSwfLoadComplete(callback);
            }, 300);
            return this;
        },
        // 创建目录
        _createFolder: function (callback) {
            if (this.isStopped) return callback(ERROR_STOPPED);
            isDebug && console.log('_createFolder', this.cosUrl, this.uploadFolder);
            this._cosAjax({
                url: this.cosUrl + this.uploadFolder,
                data: {
                    op: 'upload',
                    to_over_write: 1 // 覆盖
                }
            }, callback);
            return this;
        }
    };
    if (isDebug) window.a = CosUploader;
    return CosUploader;
});