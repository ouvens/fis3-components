var _onthrow = function (e) {
    root.Badjs('[tryjs]' + e, e.stack || window.location);
    // throw a error and badjs will ignore this error
    badjsIgnore();
};