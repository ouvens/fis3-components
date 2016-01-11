(function () {
    var a = {
        exec: function (editor) {
			if(editor.name){
                
			}
        }
    },
    b = 'addpic';
    CKEDITOR.plugins.add(b, {
        init: function (editor) {
            editor.addCommand(b, a);
            editor.ui.addButton('addpic', {
                label: '添加图片',
                icon: this.path + 'addpic.jpg',
                command: b
            });
        }
    });
})();