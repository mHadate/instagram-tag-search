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
        }).done(function(d, st, ss) {
            console.log(st);
            if(d["data"].length) {
                $("#result").append($("<ul/>").addClass("thumbnails").attr("id", "photos" + count));
                list = $("#photos" + count);
                count++;
                $("div.alert").remove();
                next = d["pagination"]["next_url"];
                for(i = 0; d["data"].length > i; i++) {
                    list.append($("<li/>"));
                }
                $.each(d["data"], function(j) {
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
                        "permalink": this["link"]
                    };
                    console.log(propaty["thumb"]["url"]);
                    list.children("li").eq(j)
                        .append($("<a/>", {"href": propaty["permalink"]}).addClass("thumbnail")
                                .append($("<img/>", {
                                    "src": propaty["thumb"]["url"],
                                    "data-src": "holder.js/" + propaty["thumb"]["width"] + "x" + propaty["thumb"]["height"],
                                    "data-resouce": propaty["standard"]["url"]
                                }).hide().load(function() {
                                    if(j == d["data"].length - 1) {
                                        console.log(list);
                                        $.each(list.children("li"), function(k) {
                                            console.log(k);
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
            console.log(b);
            $("#result").children().remove().end().append($("<div/>").addClass("alert alert-block").text("よくわからないけどエラーだよ！＞＜")
                .prepend($("<h4/>").text("Oops!"))
                );
        });
    };

    $(document).on("click", "a.thumbnail", function() {
        that = this;
        boxModel = {
            "width": $(document).width(),
            "height": $(document).height()
        };

        var scrollPosition = function() {
            var viewHeight = $(window).height(),
            spacing = viewHeight - propaty["standard"]["height"];
            if(spacing > 0) {
                return spacing/2;
            }
            else {
                return 0;
            }
        };

        $("body").append($("<div/>").attr("id", "overlay").css(boxModel).fadeIn("fast", function() {
            image = $(that).children("img").attr("data-resouce");
            $(this).append($("<div/>").addClass("img-polaroid").css({
                "width": propaty["standard"]["width"],
                "height": propaty["standard"]["height"],
                "top": scrollPosition(),
                "margin-left": "-" + propaty["standard"]["width"]/2 + "px"
            }).fadeIn("slow", function() {
                it = this;
                $("<img>", {"src": image}).load(function() {
                    $(it).append($(this).fadeIn("normal"));
                });
            }));
        }).on("click", function() {
            $("#overlay").fadeOut("normal", function() {
                $(this).remove();
            });
        }));
        return false;
    });

    $("#tagSearch").submit(function(a) {
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