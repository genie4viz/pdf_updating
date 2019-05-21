jQuery(document).ready(function () {
  var initObj = new initEnv();

  initObj.init();

  //load context_area, popup_area
  // $('.canvas-container').append($('#popup_area'));
  // $('.canvas-container').append($('#context_menu'));
});

var initEnv = function () {
  var main = this;

  main.prevTool = null;
  main.drawObj = null;
  main.pdfObj = null;
  main.is_draw = 0;
  main.selTool = 0;  
  main.highlighted_cur = null;
  main.highlighted_arr = [];
  main.scale = 1;
  main.drawColor = "#ff0000"; // only for init / match with draw.js
  main.backColor = "#00ff00"; // only for init / match with draw.js

  main.init = function () {
    main.initCSS();

    //-----------------------API Test-----------------------------------------//
    //main.getJsonMeta(companyid, projectid, scenarioid, "gs.pdf");
    //main.getUserInfo(companyid);
    //main.getComments(989);
  //  main.downloadPDF();
    //------------------------------------------------------------------------//

    setTimeout(() => {
      main.initPDF();
      main.initEvents();
      main.initUploader();
      main.initColors();
      main.initFonts();
      // main.initSizes();
      window.addEventListener("resize", main.initCSS);
    }, 3000);
  };

  main.initPDF = function () {
    main.pdfObj = new classManagePDF();
    main.pdfObj.viewPDF(main.scale, 1, function (drawObj) {
      main.drawObj = drawObj;
      main.drawObj.parent = main;
    });
  };

  main.initCSS = function () {};
  main.downloadPDF = function () {
    $.post("downloadPDF.php", {}, function () {}).error(function () {});
  };
  main.saveJsonMeta = function (
    companyid,
    projectid,
    scenarioid,
    documentname,
    annotationsjson,
    uid
  ) {
    $.ajax({
      type: "POST",
      url: "https://dev.virtuele.us/bimspring/addAnnotations",
      data: {
        companyid: companyid,
        projectid: projectid,
        scenarioid: scenarioid,
        documentname: documentname,
        annotationsjson: annotationsjson,
        uid: uid
      },

      success: function (data) {
        console.log(data);
        if (data.status == "SUCCESS") {}
      },
      fail: function (data) {}
    });
  };
  main.getJsonMeta = function (companyid, projectid, scenarioid, documentname) {
    $.ajax({
      type: "POST",
      url: "https://dev.virtuele.us/bimspring/getAnnotations",
      data: {
        companyid: companyid,
        projectid: projectid,
        scenarioid: scenarioid,
        documentname: documentname
      },

      success: function (data) {
        console.log(data);
        if (data.status == "SUCCESS") {}
      },
      fail: function (data) {}
    });
  };
  main.getUserInfo = function (companyid) {
    $.ajax({
      type: "POST",
      url: "https://dev.virtuele.us/getUserInfo",
      data: {
        companyid: companyid
      },

      success: function (data) {
        console.log(data);
        if (data.status == "SUCCESS") {}
      },
      fail: function (data) {}
    });
  };
  main.getComments = function (companyid) {
    $.ajax({
      type: "POST",
      url: "https://dev.virtuele.us/bimspring/getAnnonationComments",
      data: {
        companyid: companyid
      },

      success: function (data) {
        console.log(data);
        if (data.status == "SUCCESS") {}
      },
      fail: function (data) {}
    });
  };
  main.initEvents = function () {
    // left_menu_click
    $("#menu_area dd").on("click", function (evt) {
      $("#viewer")
        .children(".page:nth-child(" + main.pdfObj.page_num + ")")
        .children(".page-container");

      evt.stopPropagation();
      
      if (!$(this).hasClass("expand")) $(".show").removeClass("show");

      if (!main.drawObj) return;

      if (
        $(this)
        .children("p")
        .attr("tool")
      ) {
        main.selTool = $(this)
          .children("p")
          .attr("tool");
      } else {
        return;
      }

      $("#menu_area").find("ul").removeClass("show");

      $("#menu_area .active").removeClass("active");
      $("#background_area").css("display", "none");
      $("#font_area").css("display", "none");
      $("#font_style").css("display", "none");
      $("#font_size").css("display", "none");
      $(this).addClass("active");
      $("#viewer")
        .children(".page:nth-child(" + main.pdfObj.page_num + ")")
        .children(".page-container")
        .css({
          "z-index": "5"
        });
      switch ($(this).index()) {
        case 0:
          main.drawObj.shape = "select";
          main.drawObj.deselectCanvas();
          main.drawObj.canvas.isDrawingMode = false;

          main.drawObj.canvas.selection = true;
          main.drawObj.setSelectable(true);
          break;
        case 1:
          main.drawObj.canvas.isDrawingMode = true;
          main.drawObj.shape = null;
          main.drawObj.setSelectable(false);          
          break;
        case 2:
          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "rect";
          main.drawObj.setSelectable(false);
          $("#background_area").css("display", "block");
          $("#font_area").css("display", "block");
          $("#font_style").css("display", "block");
          $("#font_size").css("display", "block");
          break;
        case 3:
          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "arrow";
          main.drawObj.setSelectable(false);
          break;
        case 4:
          $("#font_area").css("display", "block");
          $("#font_style").css("display", "block");
          $("#font_size").css("display", "block");

          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "text";
          main.drawObj.setSelectable(false);
          break;
        case 5:
          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "ruler";
          main.drawObj.setSelectable(false);
          break;
        case 6:
          $("#font_area").css("display", "block");
          $("#font_style").css("display", "block");
          $("#font_size").css("display", "block");
          $("#background_area").css("display", "block");

          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "comment";
          main.drawObj.setSelectable(false);
          break;
        case 7:
          main.drawObj.shape = "highlight";
          $("#viewer")
            .children(".page:nth-child(" + main.pdfObj.page_num + ")")
            .children(".page-container")
            .css({
              "z-index": "10"
            });
          break;
        case 8:
          // $("#font_area").css("display", "block");
          // $("#font_style").css("display", "block");
          // $("#font_size").css("display", "block");
          $("#background_area").css("display", "block");

          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "attach";
          main.drawObj.setSelectable(false);
          break;
        case 9:
          // $("#font_area").css("display", "block");
          // $("#font_style").css("display", "block");
          // $("#font_size").css("display", "block");
          $("#background_area").css("display", "block");
          main.drawObj.canvas.isDrawingMode = false;
          main.drawObj.shape = "picture";
          main.drawObj.setSelectable(false);
          break;
        case 10:
          // $("#font_area").css("display", "block");
          // $("#font_style").css("display", "block");
          // $("#font_size").css("display", "block");
          break;
        case 11:
          // $("#background_area").css("display", "block");
          break;
      }
    });
    

    $(".expand").on("click", function () {      
      if ($(this).children("ul").hasClass("show")) {
        $(this).children("ul").removeClass("show");        
      } else {
        $("#menu_area").find("ul").removeClass("show");
        $(this)
          .children("ul")
          .addClass("show");
        $("#slider_stroke_width").val(main.drawObj.lineWidth);
        $("#span_line_width").text(main.drawObj.lineWidth);  
      }      
    });
    //stroke width slider control
    $("#slider_stroke_width").on('input', function(e){
      var range_val = $(this).val() * 1;
      $("#span_line_width").text(range_val);
      main.drawObj.lineWidth = range_val;
      main.drawObj.drawSize = range_val;
      main.drawObj.canvas.freeDrawingBrush.width = range_val;
      var selectedObj = main.drawObj.canvas.getActiveObject();
      if(!selectedObj) return;
      switch(selectedObj.type){
        case 'path':
          selectedObj.set({strokeWidth: range_val});
          break;
        case 'arrow':
          selectedObj._objects[0].set({strokeWidth: range_val});
        break;
      }
      main.drawObj.canvas.renderAll();
    })
    $("#arrow_list li").on("click", function (evt) {
      var src = $(this)
        .children("img")
        .attr("src");
      var txt = $(this)
        .children("p")
        .html();
      var type = $(this).attr("mode");

      $(this)
        .parent()
        .parent()
        .children("img")
        .attr("src", src);
      $(this)
        .parent()
        .parent()
        .children("p")
        .html(txt);

      $("#arrow_list").removeClass("show");

      main.drawObj.arrowType = type;
      main.selTool = $(this)
        .children("p")
        .attr("tool");

      $(this)
        .parents("dd")
        .children("p")
        .attr("tool", main.selTool);
      evt.stopPropagation();
    });

    $("#comment_list li").on("click", function (evt) {
      var src = $(this)
        .children("img")
        .attr("src");
      var txt = $(this)
        .children("p")
        .html();
      var type = $(this).attr("mode");

      //$(this).parent().parent().children("img").attr('src', src);
      //$(this).parent().parent().children("p").html(txt);

      $("#comment_list").removeClass("show");

      main.selTool = $(this)
        .children("p")
        .attr("tool");
      $(this)
        .parents("dd")
        .children("p")
        .attr("tool", main.selTool);

      if (type == 0) {
        main.drawObj.shape = "comment";
      } else {
        main.drawObj.shape = "attach";
      }

      evt.stopPropagation();
    });

    $("#btn_insert_url").on("click", function () {
      main.showPopup("popup_url");
    });

    $("#btn_insert_img").on("click", function () {
      var filename = $("#txt_url").val();

      canvasZoom = main.canvas.getZoom();
      cPosX =
        ($("#popup_area").offset().left) / canvasZoom;
      cPosY =
        ($("#popup_area").offset().top) / canvasZoom;

      var param = {
        src: filename,
        selectable: true,
        isFront: 1,
        left: cPosX,
        top: cPosY
      };

      main.drawObj.addImage(param);
      main.hidePopup();
    });
    // show_popupmenu
    $(document).on("contextmenu", function (evt) {
      
      var top = evt.pageY - $('.page-container').offset().top;
      var left = evt.pageX - $('.page-container').offset().left;

      $("#context_menu").css("top", top + "px");
      $("#context_menu").css("left", left + "px");
      $("#context_menu").css("display", "none");
      $("#context_menu").fadeIn();

      $("#context_menu").removeClass("disabled");      
      if (!main.drawObj.canvas.getActiveObject()) {
        if(main.prevTool == null ){
          $("#context_menu").addClass("disabled");
        }
      }      
      if (main.drawObj.clipboard) {
        $("#context_menu li:nth-child(3)").addClass("enabled");
        $("#context_menu li:nth-child(3)").removeClass("disabled");
      } else {
        $("#context_menu li:nth-child(3)").removeClass("enabled");
        $("#context_menu li:nth-child(3)").addClass("disabled");
      }      

      $("#context_menu li:nth-child(1)").removeClass("disabled");
      if(main.highlighted_cur){        
        $("#context_menu li:nth-child(4)").addClass("enabled");
      }
      if (main.drawObj.canvas.getActiveObject()) {
        switch (main.drawObj.canvas.getActiveObject().type) {
          case "path":
            break;
          case "arrow":
            break;
          case "ruler":
            $("#context_menu li:nth-child(0)").addClass("disabled");
            $("#context_menu li:nth-child(1)").addClass("disabled");
            $("#context_menu li:nth-child(2)").addClass("disabled");
            break;
        }
      }

      evt.stopPropagation();
      evt.preventDefault();
    });

    $("#context_menu li").on("click", function (evt) {
      if ($(this).hasClass("disabled")) return;

      switch ($(this).index()) {
        case 0:
          var obj = main.drawObj.canvas.getActiveObject();

          canvasZoom = main.drawObj.canvas.getZoom();
          hPosX = obj.left * canvasZoom;
          hPosY = obj.top * canvasZoom;
          //	alert(obj);
          switch (obj.type) {
            case "text":
            case "rect":
            case "comment":
              $("#font_area").css("display", "block");
              $("#font_style").css("display", "block");
              $("#font_size").css("display", "block");
              if(obj.type == "comment"){
                main.prevTool = obj;                
              }else{
                main.prevTool = null;
              }
              main.drawObj.drawObj = obj;
              hWidth = main.drawObj.drawObj._objects[0].width * canvasZoom;
              hHeight = main.drawObj.drawObj._objects[0].height * canvasZoom;

              $("#popup_text textarea").val(
                main.drawObj.drawObj._objects[1].text
              );
              main.drawObj.drawObj._objects[1].text = "";
              $("#popup_text textarea").css({
                "font-size": main.drawObj.fontSize * canvasZoom
              });
              $("#popup_text textarea").css({
                padding: 5 / canvasZoom + "px"
              });
              $("#popup_text textarea").css({
                "font-family": main.drawObj.fontFamily
              });
              if (main.drawObj.fontStyle == "Bold") {
                $("#popup_text textarea").css({
                  "font-style": "normal"
                });
                $("#popup_text textarea").css({
                  "font-weight": main.drawObj.fontStyle
                });
              } else {
                $("#popup_text textarea").css({
                  "font-style": main.drawObj.fontStyle
                });
                $("#popup_text textarea").css({
                  "font-weight": "normal"
                });
              }

              $("#popup_text textarea").css({
                color: main.drawObj.drawColor
              });

              $("#popup_area").css("left", hPosX + "px");
              $("#popup_area").css("top", hPosY + "px");
              $("#popup_text textarea").focus();
              $("#popup_text textarea").css("width", hWidth + "px");
              $("#popup_text textarea").css("height", hHeight + "px");

              var resizeObj = main.drawObj.drawObj._objects[0];

              $("#popup_text textarea").mouseup(function () {
                canvasZoom = main.drawObj.canvas.getZoom();
                width = $(this).width() + 10; // think the padding (3px)
                height = $(this).height() + 10; // think the padding (3px)
                resizeObj.width = width / canvasZoom;
                resizeObj.height = height / canvasZoom;
                main.drawObj.canvas.renderAll();
              });

              main.showPopup("popup_text");
              break;
          }
          main.drawObj.canvas.deactivateAll();
          main.drawObj.canvas.renderAll();
          break;
        case 1:          
          if(main.prevTool != null){//comment text copy            
            var txt_start = $('#popup_text textarea')[0].selectionStart;
            var txt_end = $('#popup_text textarea')[0].selectionEnd;
            var selectedText = $('#popup_text textarea')[0].value.substring(txt_start, txt_end);            
            // main.prevTool.prevText = main.prevTool._objects[1].text;
            main.prevTool._objects[1].clone_text = selectedText;
            main.drawObj.copy(main.prevTool);
            // main.prevTool._objects[1].text = prevText;
          }else{
            main.drawObj.copy();
          }          

          break;
        case 2:
          // if(main.prevTool != null){
          //   main.prevTool._objects[1].text = main.prevTool._objects[1].prevText;
          // }
          zoom = main.drawObj.canvas.getZoom();
          xPos =
            $("#context_menu").offset().left -
            $(".canvas-container").offset().left;
          yPos =
            $("#context_menu").offset().top -
            $(".canvas-container").offset().top;
          main.drawObj.paste(xPos / zoom, yPos / zoom);
          break;
        case 3:
          if(main.highlighted_cur){           
            $('.' + main.highlighted_cur).each(function(index){
              var parent_text = $(this).parent().text();
              $(this).parent().text(parent_text);
              $(this).remove();
            });
            main.highlighted_arr = main.highlighted_arr.filter(e => e != main.highlighted_cur);
            main.highlighted_cur = false;
          }else{
            main.drawObj.delete();
          }
          
          main.hidePopup();
          break;
        case 4:
          break;
      }

      $("#context_menu").css("display", "none");
    });

    $('.page').mousedown(function(evt){
      console.log(evt.target, 'mouse clicked on page class')
    });
    $("#viewer").on("mouseup", ".page-container", function (evt) {      
      if(main.drawObj.shape == "select"){
        var sel_class = evt.target.className.split(' ')[0];
        if(sel_class.includes('hl_')){
          for(var i = 0; i < main.highlighted_arr.length; i++){
            $('.' + main.highlighted_arr[i]).each(function(index){
              $(this).attr('class', main.highlighted_arr[i] + ' highlighted');
            });  
          }          
          main.highlighted_cur = sel_class;          
          $('.' + sel_class).each(function(index){
            $(this).attr('class', sel_class + ' selected');
          });
        }
      }else if(main.drawObj.shape == "highlight"){        
        main.highlight();
        main.clearSelection();
        // evt.preventDefault();
      }
    });
    
    $("#btn_set").on("click", function () {
      var feets = $("#unit_feet").val(),
          inch = $("#unit_inch").val(),
          fraction = $("#unit_fraction").val(), r_fraction;
      if(!feets && !inch && !fraction){
        alert('Set one of these values.')
      }else{
        if(!fraction || fraction.split("/").length == 0 || fraction.split("/")[0] == '0'){
          r_fraction = 0;
        }else{
          r_fraction = fraction.split("/")[0]/fraction.split("/")[1];
        }
        if(!inch) inch = 0;
        if(!feets) feets = 0;
        var total_in = (feets * 12 + inch/1 + r_fraction);
        main.drawObj.rulerScale = total_in / main.drawObj.line_dist;
        main.drawObj.unit = "in";
        main.drawObj.drawObj._objects[1].set({
          text: "Length : " +
            main.drawObj.rulerLabel(
              main.drawObj.line_dist,
              main.drawObj.rulerScale
            ),
          ruler_values: main.drawObj.rulerValues(main.drawObj.line_dist, main.drawObj.rulerScale)
        });      
        main.drawObj.canvas.renderAll();
        main.hidePopup();
      }
    });

    $("#tool_area dd").on("click", function () {
      var index = $(this).index();

      if (index == 1) {
        main.scale -= 0.1;
      } else {
        main.scale += 0.1;
      }
      // set page size for scale.
      // $('.page').width(main.pdfObj.default_width * main.scale);
      // $('.page').height(main.pdfObj.default_height * main.scale);

      var page = main.pdfObj.curr_page;
      var viewport = page.getViewport(main.scale);
      var context = main.pdfObj.curr_context;

      context.viewport = viewport;
      page.render(context);
      main.drawObj.canvas.setZoom(main.scale);
      main.drawObj.canvas.renderAll();
      main.reposEdit();
    });
  };

  main.reposEdit = function () {
    if (
      $("#popup_area").css("display") == "block" &&
      $("#popup_area")
      .find("#popup_text")
      .hasClass("active") &&
      main.drawObj.drawObj
    ) {
      canvasZoom = main.drawObj.canvas.getZoom();
      hPosX =
        main.drawObj.drawObj.left * canvasZoom;
      hPosY =
        main.drawObj.drawObj.top * canvasZoom;
      hWidth = main.drawObj.drawObj._objects[0].width * canvasZoom;
      hHeight = main.drawObj.drawObj._objects[0].height * canvasZoom;

      $("#popup_text textarea").css({
        "font-size": main.drawObj.fontSize * canvasZoom
      });
      $("#popup_text textarea").css({
        padding: 5 * canvasZoom + "px"
      });
      $("#popup_text textarea").css({
        "font-family": main.drawObj.fontFamily
      });
      if (main.drawObj.fontStyle == "Bold") {
        $("#popup_text textarea").css({
          "font-style": "normal"
        });
        $("#popup_text textarea").css({
          "font-weight": main.drawObj.fontStyle
        });
      } else {
        $("#popup_text textarea").css({
          "font-style": main.drawObj.fontStyle
        });
        $("#popup_text textarea").css({
          "font-weight": "normal"
        });
      }

      $("#popup_text textarea").css({
        color: main.drawObj.drawColor
      });

      $("#popup_area").css("left", hPosX + "px");
      $("#popup_area").css("top", hPosY + "px");
      $("#popup_text textarea").focus();
      $("#popup_text textarea").css("width", hWidth + "px");
      $("#popup_text textarea").css("height", hHeight + "px");
    }
  };
  main.getRandomInt = function(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  main.removeDuplicated = function(arr) {    
    var uniqueNames = [];
    $.each(arr, function(i, el){
        if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
  }
  main.highlight = function () {
    // console.clear();
    
    var range = window.getSelection().getRangeAt(0),
      parent = range.commonAncestorContainer,
      start = range.startContainer,
      end = range.endContainer;

    var curClass = 'hl_' + main.getRandomInt(10000);
    var startDOM = start.parentElement == parent ? start.nextSibling : start.parentElement;    
    // startDOM.setAttribute('class', curClass);
    console.log(startDOM, 'startDOM')
    var currentDOM = startDOM.nextElementSibling;
    var endDOM = end.parentElement == parent ? end : end.parentElement;
    // endDOM.setAttribute('class', curClass);
    console.log(endDOM, 'endDOM')
    //Process Start Element
    main.highlightText(startDOM, "START", range.startOffset);
    console.log(currentDOM, 'currentDOM before')
    while (currentDOM != endDOM && currentDOM != null) {      
      // currentDOM.setAttribute('class', curClass);
      main.highlightText(currentDOM);
      console.log(currentDOM, 'currentDOM')
      currentDOM = currentDOM.nextElementSibling;      
    }
    //Process End Element    
    main.highlightText(endDOM, "END", range.endOffset);    
    $('.highlight').each(function(index){
      $(this).attr('class', curClass + " highlighted");
    });
    main.highlighted_cur = curClass;
    main.highlighted_arr.push(curClass);
    main.highlighted_arr = main.removeDuplicated(main.highlighted_arr);
  };

  main.highlightText = function (elem, offsetType, idx) {      
    if (elem.nodeType == 3) {
      var span = document.createElement("span");      
      span.setAttribute("class", "highlight");
      var origText = elem.textContent,
        text,
        prevText,
        nextText;
      if (offsetType == "START") {
        text = origText.substring(idx);
        prevText = origText.substring(0, idx);
      } else if (offsetType == "END") {
        text = origText.substring(0, idx);
        nextText = origText.substring(idx);
      } else {
        text = origText;
      }
      span.textContent = text;

      var parent = elem.parentElement;
      parent.replaceChild(span, elem);
      if (prevText) {
        var prevDOM = document.createTextNode(prevText);        
        parent.insertBefore(prevDOM, span);
      }
      if (nextText) {
        var nextDOM = document.createTextNode(nextText);        
        //parent.appendChild(nextDOM);
        parent.insertBefore(nextDOM, span.nextSibling);
        //parent.insertBefore(span, nextDOM);
      }
      return;
    }
    var childCount = elem.childNodes.length;

    for (var i = 0; i < childCount; i++) {
      if (offsetType == "START" && i == 0)
        main.highlightText(elem.childNodes[i], "START", idx);
      else if (offsetType == "END" && i == childCount - 1)
        main.highlightText(elem.childNodes[i], "END", idx);
      else main.highlightText(elem.childNodes[i]);
    }
  };

  main.clearSelection = function () {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  };

  main.initUploader = function () {
    var btn = document.getElementById("btn_file_upload");
    var uploader = new ss.SimpleUpload({
      button: btn,
      url: "php/file_upload.php",
      name: "uploadfile",
      multipart: true,
      hoverClass: "hover",
      focusClass: "focus",
      responseType: "json",
      accept: ".png, .jpg, .gif, .jpeg, .bmp",

      onComplete: function (filename, response) {
        cPosX =
          $("#popup_area").offset().left / canvasZoom;
        cPosY =
          $("#popup_area").offset().top  / canvasZoom;

        var param = {
          src: "tmp/" + filename,
          selectable: true,
          isFront: 1,
          left: cPosX,
          top: cPosY
        };

        main.drawObj.drawObj.src = "tmp/" + filename;
        $("#popup_image img").attr("src", "tmp/" + filename);
        $("#popup_image img").css("width", "320px");
        $("#popup_image img").css("height", "240px");
        main.hidePopup();
        main.showPopup("popup_image");
      },
      onError: function (err) {
        console.log("error", err);
      }
    });

    var btn1 = document.getElementById("btn_attach_upload");
    var uploader1 = new ss.SimpleUpload({
      button: btn1,
      url: "php/file_upload.php",
      name: "uploadfile",
      multipart: true,
      hoverClass: "hover",
      focusClass: "focus",
      responseType: "json",

      onComplete: function (filename, response) {
        $("#popup_attach object").attr("data", "tmp/" + filename);
        $("#popup_attach object").css("display", "none");
        $("#popup_attach object").css("display", "block");
        $("#attach_file").attr("href", "tmp/" + filename);
        $("#attach_file").html("File : " + filename);
        $("#btn_attach_upload").css("display", "none");
        main.drawObj.drawObj.src = "tmp/" + filename;
        main.drawObj.drawObj.file = filename;
        
      },
      onError: function (err) {
        console.log("error", err);
      }
    });
  };

  main.initColors = function () {
    $("#color_area").css("background-color", main.drawColor);
    $("#color_background").css("background-color", main.backColor);

    $("#color_area")
      .parent()
      .ColorPicker({
        onChange: function (color, hex) {
          $("#color_area").css("background-color", "#" + hex);
          $("#popup_text textarea").css({
            color: "#" + hex
          });

          main.drawObj.drawColor = "#" + hex;
          main.drawObj.canvas.freeDrawingBrush.color = main.drawObj.drawColor;
          
          if (main.drawObj.drawObj) {
            _setForeColor(main.drawObj.drawObj);
          }
          if (main.drawObj.selectObj) {
            _setForeColor(main.drawObj.selectObj);
          }
          

          main.drawObj.canvas.renderAll();

          function _setForeColor(obj) {            
            if (obj._objects) {
              obj._objects.forEach(element => {
                __setForeColor(element);
              });
            } else {
              __setForeColor(obj);
            }

            function __setForeColor(obj) {
              if (obj.type) {
                switch (obj.type) {
                  case "text":
                    obj.set("fill", main.drawObj.drawColor);
                    break;
                  case "path":
                    obj.set("stroke", main.drawObj.drawColor);
                    break;
                  case "cloud":
                    obj.set("stroke", main.drawObj.drawColor);
                    break;
                }
              }
            }
          }
        }
      })
      .ColorPickerSetColor(main.drawColor);

    $("#color_background")
      .parent()
      .ColorPicker({
        onChange: function (color, hex) {
          $("#color_background").css("background-color", "#" + hex);
          main.drawObj.backColor = "#" + hex;
          if (main.drawObj.drawObj) {
            _setBackColor(main.drawObj.drawObj);
          }
          if (main.drawObj.selectObj) {
            _setBackColor(main.drawObj.selectObj);
          }
          main.drawObj.canvas.renderAll();

          function _setBackColor(obj) {
            if (obj._objects) {
              obj._objects.forEach(element => {
                __setBackColor(element);
              });
            } else {
              __setBackColor(obj);
            }

            function __setBackColor(obj) {
              if (obj.type) {
                switch (obj.type) {
                  case "background":
                    obj.set("fill", main.drawObj.backColor);
                    break;
                  case "bg_stroke":
                    obj.set("stroke", main.drawObj.backColor);
                    break;
                  case "attach":
                  case "picture":
                    obj.set("fill", main.drawObj.backColor);
                    break;
                }
              }
            }
          }
        }
      })
      .ColorPickerSetColor(main.backColor);
  };
  main.showPopup = function (id) {
    $("#popup_area").css("display", "block");
    $("#popup_area")
      .find(".active")
      .removeClass("active");
    $("#popup_area")
      .find("#" + id)
      .addClass("active");
  };

  main.hidePopup = function () {
    $("#popup_area").css("display", "none");
    $("#popup_area")
      .find(".active")
      .removeClass("active");
  }; 

  main.initFonts = function () {
    var font_arr = ["Arial Black", "Cursive", "Sans-serif"];
    var font_html = "";
    var height = $("#font_area li").length * 35;

    for (var i = 0; i < font_arr.length; i++) {
      font_html += "<li>" + font_arr[i] + "</li>";
    }

    $("#font_area ul").html(font_html);
    $("#font_area ul").css("height", height + "px");

    $("#font_area li").on("click", function () {
      $("#font_area h5").html($(this).html());
      main.drawObj.fontFamily = $(this).html();
      $("#popup_text textarea").css({
        "font-family": $(this).html()
      });

      if (main.drawObj.drawObj) {
        _setFontFamily(main.drawObj.drawObj);
      }
      if (main.drawObj.selectObj) {
        _setFontFamily(main.drawObj.selectObj);
      }

      function _setFontFamily(obj) {
        if (obj._objects) {
          obj._objects.forEach(element => {
            __setFontFamily(element);
          });
        } else {
          __setFontFamily(obj);
        }

        main.drawObj.canvas.renderAll();

        function __setFontFamily(obj) {
          if (obj.type) {
            switch (obj.type) {
              case "text":
                obj.fontFamily = main.drawObj.fontFamily;
                break;
            }
          }
        }
      }
    });

    $("#font_style li").on("click", function () {
      $("#font_style h5").html($(this).html());
      main.drawObj.fontStyle = $(this).html();

      if (main.drawObj.fontStyle == "Bold") {
        $("#popup_text textarea").css({
          "font-style": "normal"
        });
        $("#popup_text textarea").css({
          "font-weight": main.drawObj.fontStyle
        });
      } else {
        $("#popup_text textarea").css({
          "font-style": main.drawObj.fontStyle
        });
        $("#popup_text textarea").css({
          "font-weight": "normal"
        });
      }
      if (main.drawObj.drawObj) {
        _setFontStyle(main.drawObj.drawObj);
      }
      if (main.drawObj.selectObj) {
        _setFontStyle(main.drawObj.selectObj);
      }

      function _setFontStyle(obj) {
        if (obj._objects) {
          obj._objects.forEach(element => {
            __setFontStyle(element);
          });
        } else {
          __setFontStyle(obj);
        }

        main.drawObj.canvas.renderAll();

        function __setFontStyle(obj) {
          if (obj.type) {
            switch (obj.type) {
              case "text":
                obj.fontStyle = main.drawObj.fontStyle;
                break;
            }
          }
        }
      }
    });

    $("#font_size li").on("click", function () {
      $("#font_size h5").html($(this).html());
      main.drawObj.fontSize = $(this).html();
      $("#popup_text textarea").css({
        "font-size": main.drawObj.fontSize * canvasZoom
      });

      if (main.drawObj.drawObj) {
        _setFontSize(main.drawObj.drawObj);
      }
      if (main.drawObj.selectObj) {
        _setFontSize(main.drawObj.selectObj);
      }

      function _setFontSize(obj) {
        if (obj._objects) {
          obj._objects.forEach(element => {
            __setFontSize(element);
          });
        } else {
          __setFontSize(obj);
        }

        main.drawObj.canvas.renderAll();

        function __setFontSize(obj) {
          if (obj.type) {
            switch (obj.type) {
              case "text":
                obj.fontSize = main.drawObj.fontSize * canvasZoom;
                break;
            }
          }
        }
      }
    });
  };
};