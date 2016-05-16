// var name = 'fis3';
// fis.project.setProjectRoot('src');
// fis.processCWD = fis.project.getProjectPath()

var devDist = '../dev';
var dist = '../dist';

fis.set('project.md5Connector', '-');
fis.hook('commonjs');

/**
 * 配置进行处理的目录或文件
 */
fis.set('project.ignore', [
    'server/**',
    'node_modules/**',
    '.git/**',
    '.svn/**',
    'dev/**',
    'dist/**',
    '**/_*.scss',
    '**.md',
    'fis-conf.js',
    'package.json',
    'MIT-LICENSE'
]);

fis.match('libs/**.min.js', {
        release: false
    })
    .match(/.+\/(.+)\/.+\.tpl$/, { // js 模版一律用 .tpl,可以使用[模块名.tpl]作为模板
        isMod: true,
        rExt: 'js',
        id: '$1.tpl',
        moduleId: '$1.tpl',
        release: '$1.tpl', // 发布的后的文件名，避免和同目录下的 js 冲突
        parser: fis.plugin('swig')
    })
    .match(/^\/libs\/.+\/(.+)\.js$/i, {
        packTo: '/libs/$1.js',
        isMod: true,
        id: '$1'
    })
    .match(/libs\/mod\/(mod)\.js$/i, {
        packTo: '/libs/$1.js',
        isMod: false
    })
    .match(/^\/(component|asyncComponent)\/(.+)\/main\.js$/i, {
        isMod: true,
        id: '$2'
    })
    .match('pages/**.js', {
        isMod: true
    })
    .match('**.{scss,sass}', {
        parser: fis.plugin('node-sass', {
            include_paths: ['libs', 'pages']
        }),
        rExt: '.css'
    })
    .match(/\/(.+\.async)\.(scss|css)$/, { // 异步 css 包裹
        isMod: false,
        rExt: 'js',
        isCssLike: true,
        id: '$1',
        release: false, // @todo 这里 $1.$2 竟然有 bug ，应该和上面的 tpl 性质一样
        extras: {
            wrapcss: true
        }
    })
    .match('**.{js,tpl}', {
        // domain: 'http://7.url.cn/edu/activity/' + name
    })
    .match('**.{css,scss,sass}', {
        // domain: 'http://7.url.cn/efidu/activity/' + name
    })
    .match('::image', {
        // domain: 'http://7.url.cn/edu/activity/' + name
    })
    .match('::package', { //smart 打包
        prepackager: fis.plugin('csswrapper'),
        packager: [fis.plugin('smart', {
            autoPack: true,
            output: 'pkg/${id}.min.js',
            jsAllInOne: false
        })]
    });;

/**
 * 开发
 */
fis.media('dev')
    .match('/pages/*/*.html', {
        deploy: fis.plugin('local-deliver', {
            to: devDist
        })
    })
    .match('/{pkg,libs,asyncComponent}/**.js', {
        deploy: fis.plugin('local-deliver', {
            to: devDist
        })
    })
    .match('/pkg/pages/*/**.{css,scss,sass}', {
        optimizer: fis.plugin('clean-css'),
        deploy: fis.plugin('local-deliver', {
            to: devDist
        })
    })
    .match('::image', {
        deploy: fis.plugin('local-deliver', {
            to: devDist
        })
    })
    .match('**.{ttf, eot, tpl, png}', {
        deploy: fis.plugin('local-deliver', {
            to: devDist
        })
    })
    .match('**.json', {
        deploy: fis.plugin('local-deliver', {
            to: devDist
        })
    });

/**
 * 发布
 *  压缩、合并、文件指纹
 */
fis.media('dist')
    .match('/pages/*/*.html', {
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    })
    .match('/{pkg,libs,asyncComponent}/**.js', {
        parser: fis.plugin('babel'),
        optimizer: fis.plugin('uglify-js'),
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    })
    .match('/pkg/pages/*/**.{css,scss,sass}', {
        useHash: true,
        useSprite: true,
        optimizer: fis.plugin('clean-css'),
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    })
    .match('::image', {
        useHash: true,
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    })
    .match('**.png', {
        useHash: true,
        optimizer: fis.plugin('png-compressor'),
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    })
    .match('**.{ttf, eot}', {
        useHash: true,
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    })
    .match('**.json', {
        deploy: fis.plugin('local-deliver', {
            to: dist
        })
    });