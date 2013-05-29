if (!('console' in window)) {
    window.console = {};
    window.console.log = function(str){
        return str;
    };
}

$(function() {
    var clientId = "192a5742f3644ea8bed1d25e439286a8",
    keyword = ($("#keyword").val())?encodeURIComponent($("#keyword").val()):"cat",
    result = encodeURIComponent($("#tagSearch").children("select").val()),
    count = 0;

    var req = function(request, tag, number) {
        tag = (tag)?tag:keyword;
        number = (number)?number:result;
        APIurl = "https://api.instagram.com/v1/tags/"+ tag +"/media/recent?suppress_response_codes=true";
        $.ajax({
            url: (request)? request : APIurl,
            error: function() {
                console.log(4);
            },
            dataType: "jsonp",
            data: {
                "client_id": clientId,
                "count": number
            }
        }).done(function(d) {
            if(d["data"].length) {
//                console.log(d["data"]);
                $("#result").append($("<ul/>").addClass("thumbnails").attr("id", "photos" + count));
                list = $("#photos" + count);
                count++;
                $("div.alert").remove();
                next = d["pagination"]["next_url"];
                for(i = 0; d["data"].length > i; i++) {
                    list.append($("<li/>"));
                }
                $.each(d["data"], function(j) {
                    console.log(this);
                    propaty = {
                        "thumb": {
                            "url": this["images"]["thumbnail"]["url"],
                            "width": this["images"]["thumbnail"]["width"],
                            "height": this["images"]["thumbnail"]["height"]
                        },
                        "standard": {
                            "url": this["images"]["standard_resolution"]["url"],
                            "width": this["images"]["standard_resolution"]["width"],
                            "height": this["images"]["standard_resolution"]["height"]
                        },
                        "permalink": this["link"],
                        "caption": this["caption"]["text"],
                        "fullname": this["caption"]["from"]["full_name"],
                        "username": this["caption"]["from"]["username"],
                        "icon": this["caption"]["from"]["profile_picture"]
                    };
//                    console.log(propaty["thumb"]["url"]);
                    list.children("li").eq(j)
                        .append($("<a/>", {"href": propaty["permalink"]}).addClass("thumbnail")
                                .append($("<img/>", {
                                    "src": propaty["thumb"]["url"],
                                    "data-src": "holder.js/" + propaty["thumb"]["width"] + "x" + propaty["thumb"]["height"],
                                    "data-resouce": propaty["standard"]["url"]
                                }).hide().load(function() {
                                    if(j == d["data"].length - 1) {
//                                        console.log(list);
                                        $.each(list.children("li"), function(k) {
                                            $(this).find("img").delay(k * 300).fadeIn("normal");
                                        });
                                    }
                                })
                                       ));
                });
            }
            else {
                $("#result").children().remove().end().append($("<div/>").addClass("alert alert-block").text("そのタグじゃ見つからなかったよ！＞＜")
                .prepend($("<h4/>").text("Oops!"))
                );
                next = undefined;
            }
        }).fail(function(a,b,c) {
//            console.log(b);
            $("#result").children().remove().end().append($("<div/>").addClass("alert alert-block").text("よくわからないけどエラーだよ！＞＜")
                .prepend($("<h4/>").text("Oops!"))
                );
        });
    };

    $(document).on("click", "a.thumbnail", function(e) {
        that = this;
        boxModel = {
            "windowWidth": window.innerWidth,
            "windowHeight": window.innerHeight,
            "bodyWidth": $(document).width(),
            "bodyHeight": $(document).height()
        };

        function imageSize() {
            var boxies = new Array();
            var widthRate =  boxModel["windowWidth"] - propaty["standard"]["width"],
            heightRate =  boxModel["windowHeight"] - propaty["standard"]["height"];
            if(widthRate <= 1 && heightRate <= 1) {
                if(widthRate > heightRate) {
                    boxies["width"] = widthRate;
                    boxies["height"] = widthRate;
                }
                else {
                    boxies["width"] = heightRate;
                    boxies["height"] = heightRate;
                }
            }
            else if(widthRate >= 1 && heightRate < 1) {
                boxies["width"] = widthRate;
                boxies["height"] = widthRate;
            }
            else if (widthRate < 1 && heightRate >= 1){
                boxies["width"] = heightRate;
                boxies["height"] = heightRate;
            } else {
                boxies["width"] = propaty["standard"]["width"];
                boxies["height"] = propaty["standard"]["height"];
            }
            return boxies;
        }

        var imgSize = imageSize();

        var scrollPosition = function() {
            spacing = boxModel["windowHeight"] - imgSize["width"];
            return (spacing > 0) ?  spacing/2 : "0";
        };

        $("body").append($("<div/>").attr("id", "overlay").css({
            "width": boxModel["bodyWidth"],
            "height": boxModel["bodyHeight"],
        }).fadeIn("fast", function() {
            image = $(that).children("img").attr("data-resouce");
            $(this).append($("<div/>").addClass("img-polaroid").css({
                "width":  imgSize["width"],
                "height": imgSize["height"],
                "top": scrollPosition,
                "margin-left": "-" + imgSize["width"]/2 + "px"
            }).fadeIn("slow", function() {
                it = this;
                $("<img>", {"src": image}).load(function() {
                    $(it).append($(this).fadeIn("normal", function() {
                        $(it).append($("<div/>").addClass("instagram-metadata")
                            .append($("<div/>").addClass("icon")
                                .append($("<a/>", {"href": "http://instagram.com/" + propaty["username"], "target": "_blank"})
                                    .append($("<img/>", {"src": propaty["icon"], "alt": propaty["fullname"]}))
                                    )
                                )
                            .append($("<div/>").addClass("metadataColumn")
                                .append($("<span/>")
                                    .append($("<a/>", {"href": "http://instagram.com/" + propaty["username"], "target": "_blank"}).text(propaty["fullname"]))
                                    )
                                .append($("<div/>").addClass("caption").text(propaty["caption"]))
                                ).fadeIn("normal", function() {
                                    console.log(1);
//                                    $(this).delay(5000).animate({
//                                        opacity: 0
//                                    }, "normal", function() {
                                        $(this).removeAttr("style");
//                                    });
                                })
                            );
                    }));
                });
            }));
        }).on("click", function(e) {
            if(e.target === this) {
                $("#overlay").fadeOut("normal", function() {
                    $(this).remove();
                });
            }
        }));
        return false;
    });

    $("#tagSearch").submit(function() {
        result = encodeURIComponent($(this).children("select").val()),
        keyword = encodeURIComponent($("#keyword").val());
        $(".thumbnails").remove();
        req(undefined, keyword, result);
        return false;
    });

    $(document).on("click", "#more", function() {
        if(next != undefined) {
            req(next, keyword, result);
        }
    });

    req();
});