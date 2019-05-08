//***************************************************************************************//
//
//	FabricJS Object Drawing file
//
//***************************************************************************************//

var classDraw = function (scale, canv_id, width, height) {
	var main = this;

	main.canvasID = canv_id;
	main.canvWidth = width;
	main.canvHeight = height;
	main.canvas = null;

	main.isDrawing = 0;
	main.shape = null;
	main.drawObj = null;
	main.cloudObj = null;
	main.drawRectText = null;
	main.drawSize = 1;
	main.drawColor = "#ff0000";
	main.backColor = "#00ff00";
	main.sPos = { x: 0, y: 0 };
	main.startPosition = { x: 0, y: 0 };
	main.endPosition = { x: 0, y: 0 };
	main.arrowSize = 10;
	main.cloud_sz = 23;
	main.textWidth = 150;
	main.textHeight = 90;

	main.arrowType = 0;
	main.scale = scale;
	main.rulerScale = false;
	main.unit = "";
	main.parent = null;

	main.fontSize = 15;
	main.fontFamily = "Arial Black";
	main.fontStyle = "Normal";

	main.init = function () {
		main.canvasCSS();
		main.initFabric();
		main.initEvent();
	}

	main.canvasCSS = function () {
		$("#" + main.canvasID).attr("width", main.canvWidth);
		$("#" + main.canvasID).attr("height", main.canvHeight);
		$("#" + main.canvasID).css("width", main.canvWidth);
		$("#" + main.canvasID).css("height", main.canvHeight);

		if (main.canvas) {
			main.canvas.setWidth(main.canvWidth);
			main.canvas.setHeight(main.canvHeight);
			main.canvas.renderAll();
			main.canvas.calcOffset();
		}

	}

	main.initFabric = function () {
		main.canvas = new fabric.Canvas(main.canvasID);

		main.canvas.setZoom(main.scale);
		main.canvas.renderAll();
	}

	main.initEvent = function () {
		// $('textarea').bind('aserae,pasdf', 'select'){

		// }
		main.canvas.on("mouse:down", function (evt) {

			$("#menu_area").find("ul").removeClass("show");
			$("#color_area").parent().ColorPickerHide();
			$("#color_background").parent().ColorPickerHide();

			var left = evt.e.offsetX / main.parent.scale;
			var top = evt.e.offsetY / main.parent.scale;
			
			main.canvas.freeDrawingBrush.color = main.drawColor;
			evt.e.stopPropagation();

			if (evt.target)
				main.onObjectSelected();

			if (main.is_select) {
				main.is_select = 0;
				return;
			}

			main.deselectCanvas();

			if (!main.shape)
				return;

			main.isDrawing = 1;
			main.canvas.selection = false;
			main.sPos = { x: left, y: top };

			switch (main.shape) {
				case "rect":
					bg = new fabric.Rect(
						{
							type: "bg_stroke",
							width: main.textWidth,
							height: main.textHeight,
							fill: "transparent",
							stroke: main.backColor,
							strokeWidth: 0,
							selectable: false,
							hasBorders: true,
						});					
					text = new fabric.Textbox("",
						{
							type: "text",
							fontFamily: main.fontFamily,
							fontSize: main.fontSize,
							fontStyle: main.fontStyle,
							fill: main.drawColor,
							selectable: false,
							breakWords: true
						});					
					main.drawObj = new fabric.Group([bg, text],
						{
							type: main.shape,
							left: left,
							top: top,
							lockScalingY: true,
							selectable: false,
						});	
					var cloud_id = 'cloud_' +  (main.getCloudCounts() + 1);
					main.cloudObj = new fabric.Path(`
							M0 30 C0 0,30 0,30 30 C30 0,60 0,60 30 C60 0,90 0,90 30 C90 0,120 0,120 30 C120 0,150 0,150 30
							C180 30,180 60,150 60 C180 60,180 90,150 90 C180 90,180 120,150 120
							C150 150,120 150,120 120 C120 150,90 150,90 120 C90 150,60 150,60 120 C60 150,30 150,30 120 C30 150,0 150,0 120
							C-30 120,-30 90,0 90 C-30 90,-30 60,0 60 C-30 60,-30 30,0 30
						`,
						{
							id: cloud_id,
							type: 'cloud',
							left: left - main.cloud_sz,
							top: top - main.cloud_sz,
							scaleX: 1,
							scaleY: 1,
							lockMovementX: true,
							lockMovementY: true,
							selectable: false,							
							fill: "transparent",
							strokeWidth: 1,
							stroke: main.backColor,
					});
					//save cloud id to drawObj
					main.drawObj.cloud_id = cloud_id;

					main.cloudObj.setControlsVisibility({bl: false, br: false, mb: false, ml: false, mr: false, mt: false, tl: false, tr: false, mtr: false});
					main.canvas.add(main.drawObj);
					main.canvas.add(main.cloudObj);
					break;
				case "arrow":
					var arrow_path = "";
					if (main.arrowType == 1) {
						arrow_path = "M 0 0 L 1 0 z";
					}
					else if (main.arrowType == 2) {
						arrow_path = "M 0 -" + main.arrowSize + " L " + main.arrowSize + " 0 L 0 " + main.arrowSize + " z";
						// arrow_path += "L -" + main.arrowSize + " 0 L 0 -" + main.arrowSize + " M -" + main.arrowSize + "0 L " + main.arrowSize + " 0 z";
					} else {
						arrow_path = "M 0 -" + main.arrowSize + " L " + main.arrowSize + " 0 L 0 " + main.arrowSize + " z";
						// var arrow_path 	= "M 0 -10 L 0 10 M 0 0 L " + line_dist + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + line_dist + " 0 L " + (line_dist - 5) + " -3 M " + line_dist + " 0 L " + (line_dist - 5) + " 3 M " + line_dist + " -10 L " + line_dist + " 10 z";
					}

					var path_obj = new fabric.Path(arrow_path,
						{
							type: "path",
							left: 0,
							top: 0,
							stroke: main.drawColor,
							fill: false,							
							strokeWidth: 1
						});					
					main.drawObj = new fabric.Group([path_obj],
						{
							type: main.shape,
							left: left,
							top: top,
							height: 20,
							originY: "center",
							angle: 0,
							selectable: false,
							lockScalingY: true,
						});

					main.canvas.add(main.drawObj);
					break;
				case "text":
					bg = new fabric.Rect(
						{
							type: "bg_stroke",
							width: main.textWidth,
							height: main.textHeight,
							fill: "transparent",
							// stroke: main.backColor,
							// strokeWidth: 1,
							selectable: false,
							hasBorders: true,
						});
					text = new fabric.Textbox("",
						{
							type: "text",
							fontFamily: main.fontFamily,
							fontSize: main.fontSize,
							fontStyle: main.fontStyle,
							fill: main.drawColor,
							selectable: false,
							breakWords: true
						});

					main.drawObj = new fabric.Group([bg, text],
						{
							type: main.shape,
							left: left,
							top: top,
							lockScalingY: true,
							selectable: false,
						});
					main.canvas.add(main.drawObj);
					break;
				case "comment":
					bg = new fabric.Rect(
						{
							type: "background",
							width: main.textWidth,
							height: main.textHeight,
							fill: main.backColor,
							stroke: "black",
							strokeWidth: 1,
							selectable: false,
							hasBorders: true,
						});
					text = new fabric.Textbox("",
						{
							type: "text",
							fontFamily: main.fontFamily,
							fontSize: main.fontSize,
							fontStyle: main.fontStyle,
							fill: main.drawColor,
							selectable: false,
							breakWords: true
						});

					main.drawObj = new fabric.Group([bg, text],
						{
							type: main.shape,
							left: left,
							top: top,
							lockScalingY: true,
							selectable: false,
						});
					main.canvas.add(main.drawObj);
					break;
				case "ruler":
					var arrow_path = "M 0 -7 L 0 7 z";
					var ruler_line = null;
					var ruler_text = null;

					ruler_line = new fabric.Path(arrow_path,
						{
							type: "path",
							left: 0,
							top: 0,
							stroke: main.drawColor,
							fill: false,
							strokeWidth: 1
						});

					ruler_text = new fabric.Text("Length : 0m",
						{
							type: 'text',
							left: 0,
							top: -10,
							fill: main.drawColor,
							fontSize: 13,
							fontFamily: "arial"
						});

					main.drawObj = new fabric.Group([ruler_line, ruler_text],
						{
							type: main.shape,
							left: left,
							top: top,
							height: 20,
							originY: "center",
							angle: 0,
							lockScalingY: true,
							selectable: false,
							ruler_values: {feet: 0, inch: 0, fraction: 0}
						});

					main.canvas.add(main.drawObj);
					break;
				case "picture":
					main.drawObj = new fabric.Circle(
						{
							type: 'picture',
							type_of: 'picture',
							radius: 10,
							strokeWidth: 1,
							left: left,
							top: top,
							fill: main.backColor,
							stroke: 'blue',
							originX: 'center',
							originY: 'center',							
							selectable: false,
							hasControls: false
						});

					main.canvas.add(main.drawObj);

					canvasZoom = main.canvas.getZoom();
					hPosX = main.drawObj.left * canvasZoom;
					hPosY = main.drawObj.top * canvasZoom;

					$("#popup_area").css("left", hPosX + "px");
					$("#popup_area").css("top", hPosY + "px");
					main.showPopup("popup_picture");

					break;
				case "attach":
					main.drawObj = new fabric.Rect(
						{
							type: 'attach',
							type_of: 'attach',
							width: 15,
							height: 15,
							strokeWidth: 1,
							left: left,
							top: top,
							fill: main.backColor,
							stroke: 'blue',
							originX: 'center',
							originY: 'center',							
							selectable: false,
							hasControls: false
						});

					main.canvas.add(main.drawObj);

					canvasZoom = main.canvas.getZoom();
					hPosX = main.drawObj.left * canvasZoom;
					hPosY = main.drawObj.top * canvasZoom;

					$("#popup_area").css("left", hPosX + "px");
					$("#popup_area").css("top", hPosY + "px");

					$("#popup_attach object").removeAttr("data");
					$("#popup_attach a").attr("href", "#");
					$("#popup_attach a").html("");
					main.showPopup("popup_attach");
					break;
			}
		});

		main.canvas.on("mouse:move", function (evt) {
			if (!main.isDrawing)
				return;

			if (!main.drawObj)
				return;			
			var left = evt.e.offsetX / main.parent.scale;
			var top = evt.e.offsetY / main.parent.scale;

			var distance = Math.sqrt((left - main.sPos.x) * (left - main.sPos.x) + (top - main.sPos.y) * (top - main.sPos.y));
			var arrow_angle = Math.PI / 4;
			var radius = Math.sqrt(2 * main.arrowSize * main.arrowSize);

			switch (main.shape) {
				case "rect":
					main.cloudObj.set({
							left: Math.min(left, main.sPos.x) - main.cloud_sz * Math.abs(left - main.sPos.x)/(main.textWidth),
							top: Math.min(top, main.sPos.y) - main.cloud_sz * Math.abs(top - main.sPos.y)/(main.textHeight),
							scaleX: Math.abs(left - main.sPos.x)/(main.textWidth),
							scaleY: Math.abs(top - main.sPos.y)/(main.textHeight)
						});	
					main.drawObj.left = Math.min(left, main.sPos.x);
					main.drawObj.top = Math.min(top, main.sPos.y);

					main.drawObj._objects[0].width = Math.abs(left - main.sPos.x);
					main.drawObj._objects[0].height = Math.abs(top - main.sPos.y);
					break;
				case "arrow":
					var angle = Math.atan2(top - main.sPos.y, left - main.sPos.x);
					var arrow_path = "M 0 0 L " + distance + " 0 M " + (distance - main.arrowSize) + " -" + main.arrowSize + " ";
					arrow_path += "L " + distance + " 0 L " + (distance - main.arrowSize) + " " + main.arrowSize;

					if (main.arrowType == 1) {
						arrow_path = "M 0 0 L " + distance + " 0";
					}
					else if (main.arrowType == 2) {
						arrow_path = "M " + main.arrowSize + " -" + main.arrowSize + " ";
						arrow_path += "L 0 0 L " + main.arrowSize + " " + main.arrowSize + " ";
						arrow_path += "M 0 0 L " + distance + " 0 ";
						arrow_path += "M " + (distance - main.arrowSize) + " -" + main.arrowSize + " ";
						arrow_path += "L " + distance + " 0 L " + (distance - main.arrowSize) + " " + main.arrowSize;
					}

					var pointArr = main.pathToPointArr(arrow_path);
					var left = main.drawObj.left - distance / 2;

					main.drawObj._objects[0].set({ path: pointArr, left: distance / (-2) });
					main.drawObj._objects[0].setCoords();
					main.drawObj.set({ angle: angle / Math.PI * 180, width: distance });
					break;
				case "ruler":
					var line_dist = Math.sqrt(Math.pow(left - main.drawObj.get("left"), 2) + Math.pow(top - main.drawObj.get("top"), 2));

					var line_angle = Math.atan2(top - main.drawObj.get("top"), left - main.drawObj.get("left")) / Math.PI * 180;

					var arrow_path = "M 0 -10 L 0 10 M 0 0 L " + line_dist + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + line_dist + " 0 L " + (line_dist - 5) + " -3 M " + line_dist + " 0 L " + (line_dist - 5) + " 3 M " + line_dist + " -10 L " + line_dist + " 10 z";
					var pointArr = main.pathToPointArr(arrow_path);

					var text_width = 0;
					var text_left = 0;

					main.drawObj._objects[0].set({ path: pointArr, left: line_dist / (-2) });
					main.drawObj._objects[0].setCoords();



					if (main.rulerScale) {
						main.rulerLabel(line_dist, main.rulerScale);
						main.drawObj._objects[1].set({
							text: "Length : " + main.rulerLabel(line_dist, main.rulerScale),
							ruler_values: main.rulerValues(line_dist, main.rulerScale)
						});
					} else {
						main.drawObj._objects[1].set({ 
							text: "Length : " + main.rulerLabel(Math.round(line_dist * 100) / 100, 1),
							ruler_values: main.rulerValues(Math.round(line_dist * 100) / 100, 1)
						});
					}
					text_width = main.drawObj._objects[1].width;
					text_left = 0 - text_width / 2;

					main.line_dist = line_dist;
					main.drawObj.set({ angle: line_angle, width: line_dist, noMove: 0 });
					break;
			}

			main.drawObj.setCoords();
			main.canvas.renderAll();
		});

		main.canvas.on("mouse:up", function (evt) {
			main.isDrawing = 0;

			evt.e.stopPropagation();

			switch (main.shape) {
				case "rect":
					main.canvas.sendToBack(main.cloudObj);
					main.canvas.bringToFront(main.drawObj);
				case "text":
				case "comment":
					main.drawObj.setControlsVisibility({
						mt: false, // middle top disable
						mb: false, // midle bottom
						ml: false, // middle left
						mr: false, // middle right
					});
					canvasZoom = main.canvas.getZoom();
					hPosX = main.drawObj.left * canvasZoom;
					hPosY = main.drawObj.top * canvasZoom;
					hWidth = main.drawObj._objects[0].width * canvasZoom;
					hHeight = main.drawObj._objects[0].height * canvasZoom;
					
					$("#popup_text textarea").css({ "font-size": main.fontSize * canvasZoom});
					$("#popup_text textarea").css({ "padding": 5 * canvasZoom + "px" });
					$("#popup_text textarea").css({ "font-family": main.fontFamily });
					if (main.fontStyle == "Bold") {
						$("#popup_text textarea").css({ "font-style": "normal" });
						$("#popup_text textarea").css({ "font-weight": main.fontStyle });
					} else {
						$("#popup_text textarea").css({ "font-style": main.fontStyle });
						$("#popup_text textarea").css({ "font-weight": "normal" });
					}

					$("#popup_text textarea").css({ "color": main.drawColor });
					
					$("#popup_area").css("left", hPosX + "px");
					$("#popup_area").css("top", hPosY + "px");
					$("#popup_text textarea").focus();
					$("#popup_text textarea").css("width", hWidth + "px");
					$("#popup_text textarea").css("height", hHeight + "px");

					var resizeObj = main.drawObj._objects[0];

					$("#popup_text textarea").mouseup(function () {
						
						canvasZoom = main.canvas.getZoom();
						width = $(this).width(); // think the padding (3px)
						height = $(this).height(); // think the padding (3px)
						resizeObj.width = width / canvasZoom + 10;
						resizeObj.height = height / canvasZoom + 10;
						main.canvas.renderAll();
					});

					main.showPopup("popup_text");
					break;
				case "ruler":
					if (main.line_dist < 0.1) {
						main.canvas.remove(main.drawObj);
						return;
					}
					// if (!main.rulerScale) {
						canvasZoom = main.canvas.getZoom();
						hPosX =  main.drawObj.left * canvasZoom;
						hPosY =  main.drawObj.top * canvasZoom;

						$("#popup_area").css("left", hPosX + "px");
						$("#popup_area").css("top", hPosY + "px");
						var measure_vals = main.drawObj._objects[1].ruler_values;
						if(measure_vals){
							$("#unit_feet").val(measure_vals.feet);
							$("#unit_inch").val(measure_vals.inch);
							$("#unit_fraction").val(measure_vals.fraction);
						}else{
							$("#unit_feet").val(0);
							$("#unit_inch").val(0);
							$("#unit_fraction").val(0);
						}
						main.showPopup("popup_scale");
					// }
					break;
			}
		});
		main.canvas.on({'object:moving': function (e) {
			var group = e.target;
			if(group.type == 'rect'){
				console.log(group.cloud_id, 'cloudid')
				var cloud = main.getObjectById(group.cloud_id);
				cloud.set({
					left: group.left - main.cloud_sz * cloud.scaleX,
					top: group.top - main.cloud_sz * cloud.scaleY,				
				});	
			}
		}});
		main.canvas.on({'object:scaling': function (e) {
			var group = e.target;
			console.log(group)
			// if(group.type == 'path'){
			// 	console.log('paths')
					
			// }
		}});
		
	}
	main.getCloudCounts = function(){
		var counts = 0;		
		main.canvas.getObjects().forEach(function(o) {
			if(o.type == 'cloud') {
				counts++;
			}
		})
		return counts;
	}
	main.getObjectById = function(id){
		var retObj = null;
		main.canvas.getObjects().forEach(function(o) {
			if(o.id === id) {
				retObj = o;
			}
		})
		return retObj;
	}
	main.rulerLabel = function (pixel, rulerScale) {
		var inches = Math.round(pixel * rulerScale * 100) / 100;
		var feet = Math.floor(inches / 12);
		var in_int = Math.floor(inches - feet * 12);
		var in_dec = Math.round((inches - feet * 12 - in_int) * 100);
		var fract = main.reduce(in_dec, 100);

		return feet + " ft " + in_int + " inches " + fract[0] + "/" + fract[1] + " fraction";
	}
	main.rulerValues = function (pixel, rulerScale) {
		var inches = Math.round(pixel * rulerScale * 100) / 100;
		var feet = Math.floor(inches / 12);
		var in_int = Math.floor(inches - feet * 12);
		var in_dec = Math.round((inches - feet * 12 - in_int) * 100);
		var fract = main.reduce(in_dec, 100);
		return {
			feet: feet,
			inch: in_int,
			fraction: fract[0] + "/" + fract[1]
		};		
	}
	main.reduce = function (numerator, denominator) {
		var gcd = function gcd(a, b) {
			return b ? gcd(b, a % b) : a;
		};

		gcd = gcd(numerator, denominator);
		return [numerator / gcd, denominator / gcd];
	}

	main.onObjectSelected = function () {
		main.is_select = 1;
		main.hidePopup();
		
		if (main.canvas.getActiveObject()) {
			var obj = main.canvas.getActiveObject();			
			var left = obj.left;
			var top = obj.top;

			switch (obj.type) {
				case "cloud":
					// main.canvas.sendToBack(main.cloudObj);
					// main.canvas.bringToFront(main.drawObj);
					break;
				case "rect":
					//$("#popup_text textarea").val("ddd");
					break;
				case "picture":
					
					$("#popup_image img").attr("src", obj.src)
					$("#popup_area").css("left", left + "px");
					$("#popup_area").css("top", top + "px");

					main.showPopup("popup_image");
					break;
				
				case "attach":
					$("#popup_area").css("left", left + "px");
					$("#popup_area").css("top", top + "px");

					$("#popup_attach object").attr('data', obj.src);
					$("#attach_file").attr("href", obj.src);
					$("#attach_file").html("File : " + obj.file);

					main.showPopup("popup_attach");
					break;
			}

			main.showProperty();
		}
	}

	main.setSelectable = function (option) {
		main.canvas.forEachObject(function (object) {
			object.selectable = option;
		});
	}

	main.showProperty = function () {
		if (main.canvas.getActiveObject()) {
			main.selectObj = main.canvas.getActiveObject();
			main.hideProperty();
			switch (main.selectObj.type) {
				case "rect":
					$("#font_area").css("display", "block");
					$("#font_style").css("display", "block");
					$("#font_size").css("display", "block");
					$("#background_area").css("display", "block");
					break;
				case "text":
					$("#font_area").css("display", "block");
					$("#font_style").css("display", "block");
					$("#font_size").css("display", "block");
					break;
				case "comment":
					$("#background_area").css("display", "block");
					$("#font_area").css("display", "block");
					$("#font_style").css("display", "block");
					$("#font_size").css("display", "block");
					break;
				case "picture":
				case "attach":
					$("#background_area").css("display", "block");
					break;
			}
		}
	}

	main.hideProperty = function () {
		$("#font_area").css("display", "none");
		$("#font_style").css("display", "none");
		$("#font_size").css("display", "none");
		$("#background_area").css("display", "none");
	}

	main.deselectCanvas = function () {		
		$("#context_menu").css("display", "none")
		$(".show").removeClass("show");
		$("#popup_text textarea").unbind("mouseup");

		delete main.selectObj;
		main.hidePopup();

		if (!main.drawObj) {
			// main.hideProperty();
			return;
		}

		switch (main.drawObj.type) {
			case "select":

				main.hidePopup();
				break;
			case "rect":
			case "text":
			case "comment":
				var text = $("#popup_text textarea").val();
				$("#popup_text textarea").val("");				
				
				text_obj = main.drawObj._objects[1];
				text_obj.text = text;
				main.setCoords(main.drawObj);

				break;
			case "picture":

				break;
		}
		main.canvas.renderAll();
		main.drawObj = null;
	}

	main.setCoords = function (obj) {
		if (!obj._objects || !obj._objects[0]) {
			return;
		}

		width = obj._objects[0].width;
		height = obj._objects[0].height;

		if (obj._objects[1]) {
			obj._objects[1].width = width - 10;
			obj._objects[1].left = -(width / 2) + 5;
			obj._objects[1].top = -(height / 2) + 5;
		}

		obj._objects[0].left = -(width / 2);
		obj._objects[0].top = -(height / 2);

		obj.width = width;
		obj.height = height;

		obj.setCoords();
	}

	main.pathToPointArr = function (path_str) {
		var pArr = path_str.split(" ");
		var rArr = [];
		var tArr = [];
		var ind = 0;

		for (var i = 0; i < pArr.length; i++) {
			if (i % 3 == 0) {
				tArr[0] = pArr[i];
			}

			if (i % 3 == 1) {
				tArr[1] = pArr[i] * 1;
			}

			if (i % 3 == 2) {
				tArr[2] = pArr[i] * 1;
				rArr.push(tArr);
				tArr = [];
			}
		}

		rArr.push(tArr);

		return rArr;
	}

	main.addImage = function (param, callback) {
		if (main.pattern)
			main.canvas.remove(main.pattern);

		var imgObj = fabric.Image.fromURL(param.src, function (img) {
			var scale = Math.min(main.canvWidth / img.width, main.canvHeight / img.height);
			var width = param.width ? param.width : img.width;
			var height = param.height ? param.height : img.height;
			var select = param.selectable;
			var left = param.left ? param.left : 0;
			var top = param.top ? param.top : 0;

			if (param.autofit) {
				width = img.width * scale;
				height = img.height * scale;
			}

			var object = img.set(
				{
					top: top,
					left: left,
					width: width,
					height: height,
					selectable: select,
					angle: 0
				});

			main.pattern = object;
			main.canvas.add(object);

			// if(param.isFront)
			object.bringToFront();

			if (callback)
				callback(img.width, img.height);

			main.canvas.renderAll();
		});
	}

	main.addText = function (param) {
		var selectable = false;

		if (main.parent.selTool == "select")
			selectable = true;

		var object = new fabric.Textbox(param.text,
			{
				type: "text",
				left: param.x,
				top: param.y,
				width: param.width,
				height: param.height,
				fill: param.color,
				fontFamily: param.fontFamily,
				selectable: selectable,
				fontSize: main.fontSize,
				fontStyle: main.fontStyle,
				breakWords: true
			});

		return object;
	}
	main.addRect = function (param) {
		var selectable = false;

		var object = new fabric.Rect(
			{
				left: param.x,
				top: param.y,
				width: param.width,
				height: param.height,
				borderColor: main.drawColor,
				selectable: false
			});

		return object;
	}
	main.copy = function (obj = null, selectedText = '') {
		var active = main.canvas.getActiveObject();
		
		if(active == null){//comment partial copy
			active = obj;
		}
		
		main.clipboard = active;
	}

	main.paste = function (x, y) {
		if (!main.clipboard)
			return;

		switch (main.clipboard.type) {
			case "rect":
				var bg = fabric.util.object.clone(main.clipboard._objects[0]);
				bg.left = x;
				bg.top = y;
				var txt = fabric.util.object.clone(main.clipboard._objects[1]);				
				txt.left = x + 5;
				txt.top = y + 5;
				
				var copied = new fabric.Group([bg, txt],
					{
						left: bg.left,
						top: bg.top,
						type: main.clipboard.type
					});
				var cloud = main.getObjectById(main.clipboard.cloud_id);
				var cloud_copied = fabric.util.object.clone(cloud);
				var cloud_id = 'clould_' + (main.getCloudCounts() + 1);
				cloud_copied.set({id: cloud_id});				
				cloud_copied.left = x - main.cloud_sz * cloud.scaleX;
				cloud_copied.top = y -  main.cloud_sz * cloud.scaleY;
				main.canvas.add(cloud_copied);

				copied.cloud_id = cloud_id;

				main.canvas.sendToBack(bg);
				main.canvas.sendToBack(cloud_copied);
				main.canvas.bringToFront(txt);
				break;
			case "text":
				var bg = main.clipboard._objects[0].clone();
				bg.left = x;
				bg.top = y;

				var txt = main.clipboard._objects[1].clone();
				txt.left = x + 5;
				txt.top = y + 5;

				var copied = new fabric.Group([bg, txt],
					{
						left: bg.left,
						top: bg.top,
						type: main.clipboard.type
					});
				break;
			case "comment":
				var bg = fabric.util.object.clone(main.clipboard._objects[0]);
				bg.left = x;
				bg.top = y;
				var txt = fabric.util.object.clone(main.clipboard._objects[1]);
				if(main.clipboard._objects[1].clone_text)
					txt.text = main.clipboard._objects[1].clone_text;
				txt.left = x + 5;
				txt.top = y + 5;
				main.canvas.sendToBack(bg);
				main.canvas.bringToFront(txt);
				var copied = new fabric.Group([bg, txt],
					{
						left: bg.left,
						top: bg.top,
						type: main.clipboard.type
					});
				break;
			default:
				var copied = fabric.util.object.clone(main.clipboard);
				copied.left = x;
				copied.top = y;				
				break;
		}

		main.canvas.add(copied);
		copied.setCoords();
		main.canvas.renderAll();
	}

	main.clone = function (obj) {
		if (obj === null || typeof (obj) !== 'object')
			return obj;

		var copy = obj.constructor();

		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = main.clone(obj[attr]);
			}
		}

		return copy;
	}

	main.delete = function () {
		var active = main.canvas.getActiveObject();
		if(active.type == "rect"){
			var cloud = main.getObjectById(active.cloud_id);
			main.canvas.remove(cloud);	
		}
		if (!active)
			return;

		main.canvas.remove(active);
		main.canvas.renderAll();
	}

	main.showPopup = function (id) {
		$("#popup_area").css("display", "block");
		$("#popup_area").find(".active").removeClass("active");
		$("#popup_area").find("#" + id).addClass("active");
	}

	main.hidePopup = function () {
		$("#popup_area").css("display", "none");
		$("#popup_area").find(".active").removeClass("active");
	}

	main.init();
};


fabric.Textbox.prototype._wrapLine = function (ctx, text, lineIndex) {
	var lineWidth = 0,
		lines = [],
		line = '',
		words = text.split(' '),
		word = '',
		letter = '',
		offset = 0,
		infix = ' ',
		wordWidth = 0,
		infixWidth = 0,
		letterWidth = 0,
		largestWordWidth = 0;

	for (var i = 0; i < words.length; i++) {
		word = words[i];
		wordWidth = this._measureText(ctx, word, lineIndex, offset);
		lineWidth += infixWidth;

		// Break Words if wordWidth is greater than textbox width
		if (this.breakWords && wordWidth > this.width) {
			line += infix;
			var wordLetters = word.split('');
			while (wordLetters.length) {
				letterWidth = this._getWidthOfChar(ctx, wordLetters[0], lineIndex, offset);
				if (lineWidth + letterWidth > this.width) {
					lines.push(line);
					line = '';
					lineWidth = 0;
				}
				line += wordLetters.shift();
				offset++;
				lineWidth += letterWidth;
			}
			word = '';
		} else {
			lineWidth += wordWidth;
		}

		if (lineWidth >= this.width && line !== '') {
			lines.push(line);
			line = '';
			lineWidth = wordWidth;
		}

		if (line !== '' || i === 1) {
			line += infix;
		}
		line += word;
		offset += word.length;
		infixWidth = this._measureText(ctx, infix, lineIndex, offset);
		offset++;

		// keep track of largest word
		if (wordWidth > largestWordWidth && !this.breakWords) {
			largestWordWidth = wordWidth;
		}
	}

	i && lines.push(line);

	if (largestWordWidth > this.dynamicMinWidth) {
		this.dynamicMinWidth = largestWordWidth;
	}

	return lines;
};