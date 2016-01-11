CKEDITOR.dialog.add("link", function (p) {
    function u(a) {
        return a.replace(/'/g, "\\$&")
    }

    function w(a) {
        var b, e = r, f, g;
        b = [t, "("];
        for (var h = 0; h < e.length; h++)f = e[h].toLowerCase(), g = a[f], 0 < h && b.push(","), b.push("'", g ? u(encodeURIComponent(a[f])) : "", "'");
        b.push(")");
        return b.join("")
    }

    function x(a) {
        for (var b, e = a.length, f = [], g = 0; g < e; g++)b = a.charCodeAt(g), f.push(b);
        return"String.fromCharCode(" + f.join(",") + ")"
    }

    function y(a) {
        return(a = a.getAttribute("class")) ? a.replace(/\s*(?:cke_anchor_empty|cke_anchor)(?:\s*$)?/g,
            "") : ""
    }

    var r, t, z = CKEDITOR.plugins.link, v = function () {
            var a = this.getDialog(), b = a.getContentElement("target", "popupFeatures"), a = a.getContentElement("target", "linkTargetName"), e = this.getValue();
            if (b && a)switch (b = b.getElement(), b.hide(), a.setValue(""), e) {
                case "frame":
                    a.setLabel(p.lang.link.targetFrameName);
                    a.getElement().show();
                    break;
                case "popup":
                    b.show();
                    a.setLabel(p.lang.link.targetPopupName);
                    a.getElement().show();
                    break;
                default:
                    a.setValue(e), a.getElement().hide()
            }
        }, A = /^javascript:/, B = /^mailto:([^?]+)(?:\?(.+))?$/,
        C = /subject=([^;?:@&=$,\/]*)/, D = /body=([^;?:@&=$,\/]*)/, E = /^#(.*)$/, F = /^((?:http|https|ftp|news):\/\/)?(.*)$/, G = /^(_(?:self|top|parent|blank))$/, H = /^javascript:void\(location\.href='mailto:'\+String\.fromCharCode\(([^)]+)\)(?:\+'(.*)')?\)$/, I = /^javascript:([^(]+)\(([^)]+)\)$/, J = /\s*window.open\(\s*this\.href\s*,\s*(?:'([^']*)'|null)\s*,\s*'([^']*)'\s*\)\s*;\s*return\s*false;*\s*/, K = /(?:^|,)([^=]+)=(\d+|yes|no)/gi, L = function (a, b) {
            var e = b && (b.data("cke-saved-href") || b.getAttribute("href")) || "", f, g, h =
            {};
            e.match(A) && ("encode" == q ? e = e.replace(H, function (a, e, b) {
                return"mailto:" + String.fromCharCode.apply(String, e.split(",")) + (b && b.replace(/\\'/g, "'"))
            }) : q && e.replace(I, function (a, e, b) {
                if (e == t) {
                    h.type = "email";
                    for (var a = h.email = {}, e = /(^')|('$)/g, b = b.match(/[^,\s]+/g), g = b.length, f, i, s = 0; s < g; s++)f = decodeURIComponent, i = b[s].replace(e, "").replace(/\\'/g, "'"), i = f(i), f = r[s].toLowerCase(), a[f] = i;
                    a.address = [a.name, a.domain].join("@")
                }
            }));
            if (!h.type)if (f = e.match(E))h.type = "anchor", h.anchor = {}, h.anchor.name = h.anchor.id =
                f[1]; else if (f = e.match(B)) {
                g = e.match(C);
                e = e.match(D);
                h.type = "email";
                var i = h.email = {};
                i.address = f[1];
                g && (i.subject = decodeURIComponent(g[1]));
                e && (i.body = decodeURIComponent(e[1]))
            } else e && (g = e.match(F)) ? (h.type = "url", h.url = {}, h.url.protocol = g[1], h.url.url = g[2]) : h.type = "url";
            if (b) {
                f = b.getAttribute("target");
                h.target = {};
                h.adv = {};
                if (f)f.match(G) ? h.target.type = h.target.name = f : (h.target.type = "frame", h.target.name = f); else if (f = (f = b.data("cke-pa-onclick") || b.getAttribute("onclick")) && f.match(J)) {
                    h.target.type =
                        "popup";
                    for (h.target.name = f[1]; e = K.exec(f[2]);)("yes" == e[2] || "1" == e[2]) && !(e[1]in{height: 1, width: 1, top: 1, left: 1}) ? h.target[e[1]] = !0 : isFinite(e[2]) && (h.target[e[1]] = e[2])
                }
                f = function (a, e) {
                    var f = b.getAttribute(e);
                    null !== f && (h.adv[a] = f || "")
                };
                f("advId", "id");
                f("advLangDir", "dir");
                f("advAccessKey", "accessKey");
                h.adv.advName = b.data("cke-saved-name") || b.getAttribute("name") || "";
                f("advLangCode", "lang");
                f("advTabIndex", "tabindex");
                f("advTitle", "title");
                f("advContentType", "type");
                CKEDITOR.plugins.link.synAnchorSelector ?
                    h.adv.advCSSClasses = y(b) : f("advCSSClasses", "class");
                f("advCharset", "charset");
                f("advStyles", "style");
                f("advRel", "rel")
            }
            f = h.anchors = [];
            var j;
            if (CKEDITOR.plugins.link.emptyAnchorFix) {
                i = a.document.getElementsByTag("a");
                e = 0;
                for (g = i.count(); e < g; e++)if (j = i.getItem(e), j.data("cke-saved-name") || j.hasAttribute("name"))f.push({name: j.data("cke-saved-name") || j.getAttribute("name"), id: j.getAttribute("id")})
            } else {
                i = new CKEDITOR.dom.nodeList(a.document.$.anchors);
                e = 0;
                for (g = i.count(); e < g; e++)j = i.getItem(e), f[e] =
                {name: j.getAttribute("name"), id: j.getAttribute("id")}
            }
            if (CKEDITOR.plugins.link.fakeAnchor) {
                i = a.document.getElementsByTag("img");
                e = 0;
                for (g = i.count(); e < g; e++)(j = CKEDITOR.plugins.link.tryRestoreFakeAnchor(a, i.getItem(e))) && f.push({name: j.getAttribute("name"), id: j.getAttribute("id")})
            }
            this._.selectedElement = b;
            return h
        }, l = function (a) {
            a.target && this.setValue(a.target[this.id] || "")
        }, m = function (a) {
            a.adv && this.setValue(a.adv[this.id] || "")
        }, n = function (a) {
            a.target || (a.target = {});
            a.target[this.id] = this.getValue() ||
                ""
        }, o = function (a) {
            a.adv || (a.adv = {});
            a.adv[this.id] = this.getValue() || ""
        }, q = p.config.emailProtection || "";
    q && "encode" != q && (t = r = void 0, q.replace(/^([^(]+)\(([^)]+)\)$/, function (a, b, e) {
        t = b;
        r = [];
        e.replace(/[^,\s]+/g, function (a) {
            r.push(a)
        })
    }));
    var k = p.lang.common, b = p.lang.link;
    return{title: b.title, minWidth: 300, minHeight: 60, contents: [
        {id: "info", label: b.info, title: b.info, elements: [
            {type: "vbox", id: "urlOptions", children: [
                {type: "hbox", widths: ["70px", ""], children: [
                    {type: "vbox", type: "html", style: "font-weight:600;font-size:16px;",
                        html: "<div>http://</div>"},
                    {type: "text", id: "url", required: !0, onLoad: function () {
                        this.allowOnChange = !0
                    }, onKeyUp: function () {
                        this.allowOnChange = !1;
                        b = this.getValue();
                        c = /^((javascript:)|[#\/\.\?])/i;
                        d = /^(http|https|ftp|news):\/\/(?=.)/i.exec(b);
                        d ? this.setValue(b.substr(d[0].length)) : c.test(b);
                        this.allowOnChange = !0
                    }, onChange: function () {
                        if (this.allowOnChange)this.onKeyUp()
                    }, validate: function () {
                        var a = this.getDialog();
                        if (a.getContentElement("info", "linkType") && "url" != a.getValueOf("info", "linkType"))return!0;
                        return/javascript\:/.test(this.getValue()) ? (alert(k.invalidValue), !1) : this.getDialog().fakeObj ? !0 : CKEDITOR.dialog.validate.notEmpty(b.noUrl).apply(this)
                    }, setup: function (a) {
                        this.allowOnChange = !1;
                        a.url && this.setValue(a.url.url);
                        this.allowOnChange = !0
                    }, commit: function (a) {
                        this.onChange();
                        a.url || (a.url = {});
                        a.url.url = this.getValue();
                        this.allowOnChange = !1
                    }}
                ], setup: function () {
                }},
                {type: "button", id: "browse", hidden: "true", filebrowser: "info:url", label: k.browseServer}
            ]},
            {type: "vbox", id: "anchorOptions", width: 260,
                align: "center", padding: 0, children: [
                {type: "fieldset", id: "selectAnchorText", label: b.selectAnchor, setup: function (a) {
                    0 < a.anchors.length ? this.getElement().show() : this.getElement().hide()
                }, children: [
                    {type: "hbox", id: "selectAnchor", children: [
                        {type: "select", id: "anchorName", "default": "", label: b.anchorName, style: "width: 100%;", items: [
                            [""]
                        ], setup: function (a) {
                            this.clear();
                            this.add("");
                            for (var b = 0; b < a.anchors.length; b++)a.anchors[b].name && this.add(a.anchors[b].name);
                            a.anchor && this.setValue(a.anchor.name);
                            (a = this.getDialog().getContentElement("info",
                                "linkType")) && "email" == a.getValue() && this.focus()
                        }, commit: function (a) {
                            a.anchor || (a.anchor = {});
                            a.anchor.name = this.getValue()
                        }},
                        {type: "select", id: "anchorId", "default": "", label: b.anchorId, style: "width: 100%;", items: [
                            [""]
                        ], setup: function (a) {
                            this.clear();
                            this.add("");
                            for (var b = 0; b < a.anchors.length; b++)a.anchors[b].id && this.add(a.anchors[b].id);
                            a.anchor && this.setValue(a.anchor.id)
                        }, commit: function (a) {
                            a.anchor || (a.anchor = {});
                            a.anchor.id = this.getValue()
                        }}
                    ], setup: function (a) {
                        0 < a.anchors.length ? this.getElement().show() :
                            this.getElement().hide()
                    }}
                ]},
                {type: "html", id: "noAnchors", style: "text-align: center;", html: '<div role="note" tabIndex="-1">' + CKEDITOR.tools.htmlEncode(b.noAnchors) + "</div>", focus: !0, setup: function (a) {
                    1 > a.anchors.length ? this.getElement().show() : this.getElement().hide()
                }}
            ], setup: function () {
                this.getDialog().getContentElement("info", "linkType") || this.getElement().hide()
            }},
            {type: "vbox", id: "emailOptions", padding: 1, children: [
                {type: "text", id: "emailAddress", label: b.emailAddress, required: !0, validate: function () {
                    var a =
                        this.getDialog();
                    return!a.getContentElement("info", "linkType") || "email" != a.getValueOf("info", "linkType") ? !0 : CKEDITOR.dialog.validate.notEmpty(b.noEmail).apply(this)
                }, setup: function (a) {
                    a.email && this.setValue(a.email.address);
                    (a = this.getDialog().getContentElement("info", "linkType")) && "email" == a.getValue() && this.select()
                }, commit: function (a) {
                    a.email || (a.email = {});
                    a.email.address = this.getValue()
                }},
                {type: "text", id: "emailSubject", label: b.emailSubject, setup: function (a) {
                    a.email && this.setValue(a.email.subject)
                },
                    commit: function (a) {
                        a.email || (a.email = {});
                        a.email.subject = this.getValue()
                    }},
                {type: "textarea", id: "emailBody", label: b.emailBody, rows: 3, "default": "", setup: function (a) {
                    a.email && this.setValue(a.email.body)
                }, commit: function (a) {
                    a.email || (a.email = {});
                    a.email.body = this.getValue()
                }}
            ], setup: function () {
                this.getDialog().getContentElement("info", "linkType") || this.getElement().hide()
            }}
        ]},
        {id: "target", requiredContent: "a[target]", label: b.target, title: b.target, elements: [
            {type: "hbox", widths: ["50%", "50%"], children: [
                {type: "select",
                    id: "linkTargetType", label: k.target, "default": "notSet", style: "width : 100%;", items: [
                    [k.notSet, "notSet"],
                    [b.targetFrame, "frame"],
                    [b.targetPopup, "popup"],
                    [k.targetNew, "_blank"],
                    [k.targetTop, "_top"],
                    [k.targetSelf, "_self"],
                    [k.targetParent, "_parent"]
                ], onChange: v, setup: function (a) {
                    a.target && this.setValue(a.target.type || "notSet");
                    v.call(this)
                }, commit: function (a) {
                    a.target || (a.target = {});
                    a.target.type = this.getValue()
                }},
                {type: "text", id: "linkTargetName", label: b.targetFrameName, "default": "", setup: function (a) {
                    a.target &&
                    this.setValue(a.target.name)
                }, commit: function (a) {
                    a.target || (a.target = {});
                    a.target.name = this.getValue().replace(/\W/gi, "")
                }}
            ]},
            {type: "vbox", width: "100%", align: "center", padding: 2, id: "popupFeatures", children: [
                {type: "fieldset", label: b.popupFeatures, children: [
                    {type: "hbox", children: [
                        {type: "checkbox", id: "resizable", label: b.popupResizable, setup: l, commit: n},
                        {type: "checkbox", id: "status", label: b.popupStatusBar, setup: l, commit: n}
                    ]},
                    {type: "hbox", children: [
                        {type: "checkbox", id: "location", label: b.popupLocationBar,
                            setup: l, commit: n},
                        {type: "checkbox", id: "toolbar", label: b.popupToolbar, setup: l, commit: n}
                    ]},
                    {type: "hbox", children: [
                        {type: "checkbox", id: "menubar", label: b.popupMenuBar, setup: l, commit: n},
                        {type: "checkbox", id: "fullscreen", label: b.popupFullScreen, setup: l, commit: n}
                    ]},
                    {type: "hbox", children: [
                        {type: "checkbox", id: "scrollbars", label: b.popupScrollBars, setup: l, commit: n},
                        {type: "checkbox", id: "dependent", label: b.popupDependent, setup: l, commit: n}
                    ]},
                    {type: "hbox", children: [
                        {type: "text", widths: ["50%", "50%"], labelLayout: "horizontal",
                            label: k.width, id: "width", setup: l, commit: n},
                        {type: "text", labelLayout: "horizontal", widths: ["50%", "50%"], label: b.popupLeft, id: "left", setup: l, commit: n}
                    ]},
                    {type: "hbox", children: [
                        {type: "text", labelLayout: "horizontal", widths: ["50%", "50%"], label: k.height, id: "height", setup: l, commit: n},
                        {type: "text", labelLayout: "horizontal", label: b.popupTop, widths: ["50%", "50%"], id: "top", setup: l, commit: n}
                    ]}
                ]}
            ]}
        ]},
        {id: "upload", label: b.upload, title: b.upload, hidden: !0, filebrowser: "uploadButton", elements: [
            {type: "file", id: "upload",
                label: k.upload, style: "height:40px", size: 29},
            {type: "fileButton", id: "uploadButton", label: k.uploadSubmit, filebrowser: "info:url", "for": ["upload", "upload"]}
        ]},
        {id: "advanced", label: b.advanced, title: b.advanced, elements: [
            {type: "vbox", padding: 1, children: [
                {type: "hbox", widths: ["45%", "35%", "20%"], children: [
                    {type: "text", id: "advId", requiredContent: "a[id]", label: b.id, setup: m, commit: o},
                    {type: "select", id: "advLangDir", requiredContent: "a[dir]", label: b.langDir, "default": "", style: "width:110px", items: [
                        [k.notSet, ""],
                        [b.langDirLTR,
                            "ltr"],
                        [b.langDirRTL, "rtl"]
                    ], setup: m, commit: o},
                    {type: "text", id: "advAccessKey", requiredContent: "a[accesskey]", width: "80px", label: b.acccessKey, maxLength: 1, setup: m, commit: o}
                ]},
                {type: "hbox", widths: ["45%", "35%", "20%"], children: [
                    {type: "text", label: b.name, id: "advName", requiredContent: "a[name]", setup: m, commit: o},
                    {type: "text", label: b.langCode, id: "advLangCode", requiredContent: "a[lang]", width: "110px", "default": "", setup: m, commit: o},
                    {type: "text", label: b.tabIndex, id: "advTabIndex", requiredContent: "a[tabindex]",
                        width: "80px", maxLength: 5, setup: m, commit: o}
                ]}
            ]},
            {type: "vbox", padding: 1, children: [
                {type: "hbox", widths: ["45%", "55%"], children: [
                    {type: "text", label: b.advisoryTitle, requiredContent: "a[title]", "default": "", id: "advTitle", setup: m, commit: o},
                    {type: "text", label: b.advisoryContentType, requiredContent: "a[type]", "default": "", id: "advContentType", setup: m, commit: o}
                ]},
                {type: "hbox", widths: ["45%", "55%"], children: [
                    {type: "text", label: b.cssClasses, requiredContent: "a(cke-xyz)", "default": "", id: "advCSSClasses", setup: m, commit: o},
                    {type: "text", label: b.charset, requiredContent: "a[charset]", "default": "", id: "advCharset", setup: m, commit: o}
                ]},
                {type: "hbox", widths: ["45%", "55%"], children: [
                    {type: "text", label: b.rel, requiredContent: "a[rel]", "default": "", id: "advRel", setup: m, commit: o},
                    {type: "text", label: b.styles, requiredContent: "a{cke-xyz}", "default": "", id: "advStyles", validate: CKEDITOR.dialog.validate.inlineStyle(p.lang.common.invalidInlineStyle), setup: m, commit: o}
                ]}
            ]}
        ]}
    ], onShow: function () {
        var a = this.getParentEditor(), b = a.getSelection(), e =
            null;
        (e = z.getSelectedLink(a)) && e.hasAttribute("href") ? b.selectElement(e) : e = null;
        this.setupContent(L.apply(this, [a, e]))
    }, onOk: function () {
        var a = {}, b = [], e = {}, f = this.getParentEditor();
        this.commitContent(e);
        switch (e.type || "url") {
            case "url":
                var g = e.url && void 0 != e.url.protocol ? e.url.protocol : "http://", h = e.url && CKEDITOR.tools.trim(e.url.url) || "";
                a["data-cke-saved-href"] = 0 === h.indexOf("/") ? h : g + h;
                a['target'] = '_blank';
                break;
            case "anchor":
                g = e.anchor && e.anchor.id;
                a["data-cke-saved-href"] = "#" + (e.anchor && e.anchor.name || g || "");
                break;
            case "email":
                var i = e.email, g = i.address;
                switch (q) {
                    case "":
                    case "encode":
                        var h = encodeURIComponent(i.subject || ""), j = encodeURIComponent(i.body || ""), i = [];
                        h && i.push("subject=" + h);
                        j && i.push("body=" + j);
                        i = i.length ? "?" + i.join("&") : "";
                        "encode" == q ? (g = ["javascript:void(location.href='mailto:'+", x(g)], i && g.push("+'", u(i), "'"), g.push(")")) : g = ["mailto:", g, i];
                        break;
                    default:
                        g = g.split("@", 2), i.name = g[0], i.domain = g[1], g = ["javascript:", w(i)]
                }
                a["data-cke-saved-href"] = g.join("")
        }
        if (e.target)if ("popup" == e.target.type) {
            for (var g =
                ["window.open(this.href, '", e.target.name || "", "', '"], k = "resizable,status,location,toolbar,menubar,fullscreen,scrollbars,dependent".split(","), h = k.length, i = function (a) {
                e.target[a] && k.push(a + "=" + e.target[a])
            }, j = 0; j < h; j++)k[j] += e.target[k[j]] ? "=yes" : "=no";
            i("width");
            i("left");
            i("height");
            i("top");
            g.push(k.join(","), "'); return false;");
            a["data-cke-pa-onclick"] = g.join("");
            b.push("target")
        } else"notSet" != e.target.type && e.target.name ? a.target = e.target.name : b.push("target"), b.push("data-cke-pa-onclick",
            "onclick");
        e.adv && (g = function (f, g) {
            var h = e.adv[f];
            h ? a[g] = h : b.push(g)
        }, g("advId", "id"), g("advLangDir", "dir"), g("advAccessKey", "accessKey"), e.adv.advName ? a.name = a["data-cke-saved-name"] = e.adv.advName : b = b.concat(["data-cke-saved-name", "name"]), g("advLangCode", "lang"), g("advTabIndex", "tabindex"), g("advTitle", "title"), g("advContentType", "type"), g("advCSSClasses", "class"), g("advCharset", "charset"), g("advStyles", "style"), g("advRel", "rel"));
        g = f.getSelection();
        a.href = a["data-cke-saved-href"];
        if (this._.selectedElement) {
            f =
                this._.selectedElement;
            h = f.data("cke-saved-href");
            i = f.getHtml();
            f.setAttributes(a);
            f.removeAttributes(b);
            e.adv && e.adv.advName && CKEDITOR.plugins.link.synAnchorSelector && f.addClass(f.getChildCount() ? "cke_anchor" : "cke_anchor_empty");
            if (h == i || "email" == e.type && -1 != i.indexOf("@"))f.setHtml("email" == e.type ? e.email.address : a["data-cke-saved-href"]);
            g.selectElement(f);
            delete this._.selectedElement
        } else g = g.getRanges(1)[0], g.collapsed && (f = new CKEDITOR.dom.text("email" == e.type ? e.email.address : a["data-cke-saved-href"],
            f.document), g.insertNode(f), g.selectNodeContents(f)), f = new CKEDITOR.style({element: "a", attributes: a}), f.type = CKEDITOR.STYLE_INLINE, f.applyToRange(g), g.select()
    }, onLoad: function () {
        p.config.linkShowAdvancedTab || this.hidePage("advanced");
        p.config.linkShowTargetTab || this.hidePage("target")
    }, onFocus: function () {
        var a = this.getContentElement("info", "linkType");
        a && "url" == a.getValue() && (a = this.getContentElement("info", "url"), a.select())
    }}
});
