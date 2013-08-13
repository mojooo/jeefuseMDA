(function($) {
	$.addFlex = function(t, p) {
		if (t.grid)
			return false; // 如果Grid已经存在则返回
		// 引用默认属性
		p = $.extend({
			height : 200, // flexigrid插件的高度，单位为px
			width : 'auto', // 宽度值，auto表示根据每列的宽度自动计算
			striped : true, // 是否显示斑纹效果，默认是奇偶交互的形式
			novstripe : false,
			minwidth : 30, // 列的最小宽度
			minheight : 80, // 列的最小高度
			resizable : false, // resizable table是否可伸缩
			url : false, // ajax url,ajax方式对应的url地址
			method : 'POST', // data sending method,数据发送方式
			dataType : 'json', // type of data loaded,数据加载的类型，xml,json
			errormsg : '很抱谦!请求发生错误!', // 错误提升信息
			usepager : true, // 是否分页
			nowrap : true, // 是否不换行
			page : 1, // current page,默认当前页
			total : 1, // total pages,总页面数
			useRp : true, // use the results per page select
			// box,是否可以动态设置每页显示的结果数
			rp : 15, // results per page,每页默认的结果数
			rpOptions:[10,20,40,50,60,80,100],  // 可选择设定的每页结果数
			title : false, // 是否包含标题
			pagestat : '显示记录从{from}到{to},总数{total}条', // 显示当前页和总页面的样式
			procmsg : '加载中, 请稍等 ...', // 正在处理的提示信息
			query : '', // 搜索查询的条件
			qtype : '', // 搜索查询的类别
			qop : "Eq", // 搜索的操作符
			nomsg : '没有符合条件的记录存在', // 无结果的提示信息
			minColToggle : 1, // minimum allowed column to be hidden
			showToggleBtn : true, // show or hide column toggle popup
			hideOnSubmit : true, // 显示遮盖
			showTableToggleBtn : false, // 显示隐藏Grid
			autoload : true, // 自动加载
			blockOpacity : 0.5, // 透明度设置
			onToggleCol : false, // 当在行之间转换时
			onChangeSort : false, // 当改变排序时
			onSuccess : false, // 成功后执行
			onSubmit : false, // using a custom populate function,调用自定义的计算函数
			showcheckbox : false, // 是否显示第一列的checkbox（用于全选）
			rowhandler : false, // 是否启用行的扩展事情功能,在生成行时绑定事件，如双击，右键等
			rowbinddata : false,// 配合上一个操作，如在双击事件中获取该行的数据
			rowbinddataName:'rowData',//绑定数据存储的名称,在rowbinddata为true时有效
			extParam : {},// 添加extParam参数可将外部参数动态注册到grid，实现如查询等操作
			gridClass : "bbit-grid",
			seqdisplayName:'序号',
			showseq:true,//是否显示序号
			onrowchecked : false,// 在每一行的的checkbox选中状态发生变化时触发某个事件
			searchShow:'top',
			searchDisplay:true,
			onRequestSuccess:null,//请求成功后调用
			onRequestError:null,//请求失败后调用
			tree:false,
			treeFieldName:null,
			iconspath:"",
			treebgif:"s.gif",
			treeIsExpand:true,
			theme: "bbit-tree-lines" //bbit-tree-lines ,bbit-tree-no-lines,bbit-tree-arrows
			}, p);

		$(t).show().attr({cellPadding : 0,cellSpacing : 0,border : 0}) .removeAttr('width');  // show if hidden ,remove padding and spacing ,remove width properties

		//var gridId=$(t).attr('id')+new Date().getTime();
		var rowidx=0;
		// create grid class
		var g = {
			hset : {},
			rePosDrag : function() {

				var cdleft = 0 - this.hDiv.scrollLeft;
				if (this.hDiv.scrollLeft > 0)
					cdleft -= Math.floor(p.cgwidth / 2);

				$(g.cDrag).css({
							top : g.hDiv.offsetTop + 1
						});
				var cdpad = this.cdpad;

				$('div', g.cDrag).hide();
				// update by xuanye ,避免jQuery :visible 无效的bug
				var i = 0;
				$('thead tr:first th:visible', this.hDiv).each(function() {
							if ($(this).css("display") == "none") {
								return;
							}
							var n = i;
							// var n = $('thead tr:first th:visible',
							// g.hDiv).index(this);
							var cdpos = parseInt($('div', this).width());
							var ppos = cdpos;
							if (cdleft == 0)
								cdleft -= Math.floor(p.cgwidth / 2);

							cdpos = cdpos + cdleft + cdpad;

							$('div:eq(' + n + ')', g.cDrag).css({
										'left' : cdpos + 'px'
									}).show();

							cdleft = cdpos;
							i++;
						});

			},
			fixHeight : function(newH) {
				newH = false;
				if (!newH)
					newH = $(g.bDiv).height();
				var hdHeight = $(this.hDiv).height();
				$('div', this.cDrag).each(function() {
							$(this).height(newH + hdHeight);
						});

				var nd = parseInt($(g.nDiv).height());

				if (nd > newH)
					$(g.nDiv).height(newH).width(200);
				else
					$(g.nDiv).height('auto').width('auto');

				$(g.block).css({
							height : newH,
							marginBottom : (newH * -1)
						});

				var hrH = g.bDiv.offsetTop + newH;
				if (p.height != 'auto' && p.resizable)
					hrH = g.vDiv.offsetTop;
				$(g.rDiv).css({
							height : hrH
						});

			},
			dragStart : function(dragtype, e, obj) { // default drag function
				// start

				if (dragtype == 'colresize') // column resize
				{
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					var n = $('div', this.cDrag).index(obj);
					// var ow = $('th:visible div:eq(' + n + ')',
					// this.hDiv).width();
					var ow = $('th:visible:eq(' + n + ') div', this.hDiv)
							.width();
					$(obj).addClass('dragging').siblings().hide();
					$(obj).prev().addClass('dragging').show();

					this.colresize = {
						startX : e.pageX,
						ol : parseInt(obj.style.left),
						ow : ow,
						n : n
					};
					$('body').css('cursor', 'col-resize');
				} else if (dragtype == 'vresize') // table resize
				{
					var hgo = false;
					$('body').css('cursor', 'row-resize');
					if (obj) {
						hgo = true;
						$('body').css('cursor', 'col-resize');
					}
					this.vresize = {
						h : p.height,
						sy : e.pageY,
						w : p.width,
						sx : e.pageX,
						hgo : hgo
					};

				}

				else if (dragtype == 'colMove') // column header drag
				{
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					this.hset = $(this.hDiv).offset();
					this.hset.right = this.hset.left
							+ $('table', this.hDiv).width();
					this.hset.bottom = this.hset.top
							+ $('table', this.hDiv).height();
					this.dcol = obj;
					this.dcoln = $('th', this.hDiv).index(obj);

					this.colCopy = document.createElement("div");
					this.colCopy.className = "colCopy";
					this.colCopy.innerHTML = obj.innerHTML;
					if ($.browser.msie) {
						this.colCopy.className = "colCopy ie";
					}

					$(this.colCopy).css({
								position : 'absolute',
								float : 'left',
								display : 'none',
								textAlign : obj.align
							});
					$('body').append(this.colCopy);
					$(this.cDrag).hide();

				}

				$('body').noSelect();

			},
			reSize : function() {
				this.gDiv.style.width = p.width;
				this.bDiv.style.height = p.height;
				$(this.bDiv).height(p.height);
				this.fixHeight(p.height);
			},
			dragMove : function(e) {

				if (this.colresize) // column resize
				{
					var n = this.colresize.n;
					var diff = e.pageX - this.colresize.startX;
					var nleft = this.colresize.ol + diff;
					var nw = this.colresize.ow + diff;
					if (nw > p.minwidth) {
						$('div:eq(' + n + ')', this.cDrag).css('left', nleft);
						this.colresize.nw = nw;
					}
				} else if (this.vresize) // table resize
				{
					var v = this.vresize;
					var y = e.pageY;
					var diff = y - v.sy;
					if (!p.defwidth)
						p.defwidth = p.width;
					if (p.width != 'auto' && !p.nohresize && v.hgo) {
						var x = e.pageX;
						var xdiff = x - v.sx;
						var newW = v.w + xdiff;
						if (newW > p.defwidth) {
							this.gDiv.style.width = newW + 'px';
							p.width = newW;
						}
					}
					var newH = v.h + diff;
					if ((newH > p.minheight || p.height < p.minheight)
							&& !v.hgo) {
						this.bDiv.style.height = newH + 'px';
						p.height = newH;
						this.fixHeight(newH);
					}
					v = null;
				} else if (this.colCopy) {
					$(this.dcol).addClass('thMove').removeClass('thOver');
					if (e.pageX > this.hset.right || e.pageX < this.hset.left
							|| e.pageY > this.hset.bottom
							|| e.pageY < this.hset.top) {
						// this.dragEnd();
						$('body').css('cursor', 'move');
					} else
						$('body').css('cursor', 'pointer');

					$(this.colCopy).css({
								top : e.pageY + 10,
								left : e.pageX + 20,
								display : 'block'
							});
				}

			},
			dragEnd : function() {
				if (this.colresize) {
					var n = this.colresize.n;
					var nw = this.colresize.nw;
					// $('th:visible div:eq(' + n + ')', this.hDiv).css('width',
					// nw);
					$('th:visible:eq(' + n + ') div', this.hDiv).css('width',
							nw);

					$('tr', this.bDiv).each(function() {
						// $('td:visible div:eq(' + n + ')',
						// this).css('width', nw);
						$('td:visible:eq(' + n + ') div', this)
								.css('width', nw);
					});
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					$('div:eq(' + n + ')', this.cDrag).siblings().show();
					$('.dragging', this.cDrag).removeClass('dragging');
					this.rePosDrag();
					this.fixHeight();
					this.colresize = false;
				} else if (this.vresize) {
					this.vresize = false;
				} else if (this.colCopy) {
					$(this.colCopy).remove();
					if (this.dcolt != null) {
						if (this.dcoln > this.dcolt) {
							$('th:eq(' + this.dcolt + ')', this.hDiv)
									.before(this.dcol);
						} else {
							$('th:eq(' + this.dcolt + ')', this.hDiv)
									.after(this.dcol);
						}
						this.switchCol(this.dcoln, this.dcolt);
						$(this.cdropleft).remove();
						$(this.cdropright).remove();
						this.rePosDrag();
					}
					this.dcol = null;
					this.hset = null;
					this.dcoln = null;
					this.dcolt = null;
					this.colCopy = null;
					$('.thMove', this.hDiv).removeClass('thMove');
					$(this.cDrag).show();
				}
				$('body').css('cursor', 'default');
				$('body').noSelect(false);
			},
			toggleCol : function(cid, visible) {
				var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
				var n = $('thead th', g.hDiv).index(ncol);
				var cb = $('input[value=' + cid + ']', g.nDiv)[0];
				if (visible == null) {
					visible = ncol.hide;
				}
				if ($('input:checked', g.nDiv).length < p.minColToggle
						&& !visible)
					return false;
				if (visible) {
					ncol.hide = false;
					$(ncol).show();
					cb.checked = true;
				} else {
					ncol.hide = true;
					$(ncol).hide();
					cb.checked = false;
				}
				$('tbody tr', t).each(function() {
							if (visible)
								$('td:eq(' + n + ')', this).show();
							else
								$('td:eq(' + n + ')', this).hide();
						});
				this.rePosDrag();
				if (p.onToggleCol)
					p.onToggleCol(cid, visible);
				return visible;
			},
			switchCol : function(cdrag, cdrop) { // switch columns
				$('tbody tr', t).each(function() {
					if (cdrag > cdrop)
						$('td:eq(' + cdrop + ')', this).before($('td:eq('
										+ cdrag + ')', this));
					else
						$('td:eq(' + cdrop + ')', this).after($('td:eq('
										+ cdrag + ')', this));
				});
				// switch order in nDiv
				if (cdrag > cdrop)
					$('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq('
									+ cdrag + ')', this.nDiv));
				else
					$('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq('
									+ cdrag + ')', this.nDiv));
				if ($.browser.msie && $.browser.version < 7.0) {
					var cnCheck = $('tr:eq(' + cdrop + ') input', this.nDiv)[0];
					if (cnCheck)
						cnCheck.checked = true;
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
			},
			scroll : function() {
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				this.rePosDrag();
			},
			hideLoading : function() {
				$('.pReload', this.pDiv).removeClass('loading');
				if (p.hideOnSubmit)
					$(g.block).remove();
				$('.pPageStat', this.pDiv).html(p.errormsg);
				this.loading = false;
			},
			addData : function(data) { // parse data
				rowidx=0;
				if (p.preProcess) {
					data = p.preProcess(data);
				}
				$('.pReload', this.pDiv).removeClass('loading');
				this.loading = false;

				if (!data) {
					$('.pPageStat', this.pDiv).html(p.errormsg);
					return false;
				}
				var temp = p.total;
				if (p.dataType == 'xml') {
					p.total = +$('rows total', data).text();
				} else {
					p.total = data.total;
				}
				if (p.total < 0) {
					p.total = temp;
				}
				if (p.total == 0) {
					$('tr, a, td, div', t).unbind();
					$(t).empty();
					p.pages = 1;
					p.page = 1;
					this.buildpager();
					$('.pPageStat', this.pDiv).html(p.nomsg);
					if (p.hideOnSubmit)
						$(g.block).remove();
					return false;
				}

				p.pages = Math.ceil(p.total / p.rp);

				if (p.dataType == 'xml') {
					p.page = +$('rows page', data).text();
				} else {
					p.page = data.page;
				}
				this.buildpager();
				var ths = $('thead tr:first th', g.hDiv);
				var thsdivs = $('thead tr:first th div', g.hDiv);
				if (p.dataType == 'json') {
					var tbhtml=[];
					tbhtml.push("<table cellpadding='0' cellspacing='0' border='0'><tbody>");
					if (data.rows != null) {
						if(p.tree){//process tree
							var rowLen=data.rows.length;
							$.each(data.rows, function(i, row) {
								g.buildTreeRow(ths,thsdivs,tbhtml,row,"",0, i, i == rowLen - 1,p.treeIsExpand);
							});
						}else{
							$.each(data.rows, function(i, row) {
								g.buildRow(ths,thsdivs,tbhtml,row);
							});
						}
					}
					tbhtml.push("</tbody></table>");
					$(t).html(tbhtml.join(""));
                	g.addRowProps(data.rows); 
				} else if (p.dataType == 'xml') {
					var tbhtml = [];
					tbhtml.push("<table cellpadding='0' cellspacing='0' border='0'><tbody>");
					i = 1;
					$("rows row", data).each(function() {
						i++;
						var robj = this;
						var arrdata = new Array();
						$("cell", robj).each(function() {
									arrdata.push($(this).text());
								});
						var nid = $(this).attr('id');
						tbhtml.push("<tr id='", "row", nid, "'");
						if (i % 2 && p.striped) {
							tbhtml.push(" class='erow'");
						}
						if (p.rowbinddata) {
							tbhtml.push("ch='", arrdata.join("_FG$SP_"), "'");
						}
						tbhtml.push(">");
						var trid = nid;
						$(ths).each(function(j) {
							tbhtml.push("<td align='", this.align, "'");
							if (this.hide) {
								tbhtml.push(" style='display:none;'");
							}
							var tdclass = "";
							var tddata = "";
							var idx = $(this).attr('axis').substr(3);

							if (p.sortname
									&& p.sortname == $(this).attr('abbr')) {
								tdclass = 'sorted';
							}
							var width = thsdivs[j].style.width;

							var div = [];
							div.push("<div style='text-align:", this.align,";width:", width, ";");
							if (p.nowrap == false) {
								div.push("white-space:normal");
							}
							div.push("'>");

							if (idx == "-1") { // checkbox
								div.push("<input type='checkbox' id='chk_",nid, "' class='itemchk' value='", nid,"'/>");
								if (tdclass != "") {
									tdclass += " chboxtd";
								} else {
									tdclass += "chboxtd";
								}
							} else {
								var divInner = arrdata[idx] || "&nbsp;";
								if (p.rowbinddata) {
									tddata = arrdata[idx] || "";
								}
								if (this.process) {
									divInner = this.process(divInner, trid);
								}
								div.push(divInner);
							}
							div.push("</div>");
							if (tdclass != "") {
								tbhtml.push(" class='", tdclass, "'");
							}
							tbhtml.push(" axis='", tddata, "'", ">", div.join(""), "</td>");
						});
						tbhtml.push("</tr>");
					});
					tbhtml.push("</tbody></table>");
					$(t).html(tbhtml.join(""));
					g.addRowProps();
				}
				// this.rePosDrag();
				if (p.hideOnSubmit)
					$(g.block).remove(); // $(t).show();
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				if ($.browser.opera)
					$(t).css('visibility', 'visible');
				if (p.onSuccess)
					p.onSuccess();
			},
			buildRow:function(ths,thsdivs,trhtml,row){
				rowidx++;
				var rowTrId="row"+(row[p.indexId]?row[p.indexId]:rowidx);
				trhtml.push("<tr id='", rowTrId,"' seq='",rowidx,"'");
				if ((rowidx+1) % 2 && p.striped) {
					trhtml.push(" class='erow'");
				}
				trhtml.push(">");
				g.setTRHtml(ths,thsdivs,trhtml,row,rowidx);
				trhtml.push("</tr>");
			},
			//build tree row
			buildTreeRow :function(ths,thsdivs,trhtml,row,pid,deep,path,isend,isexpand){
				rowidx++;
				var rowTrId="row"+(row[p.indexId]?row[p.indexId]:rowidx);
				trhtml.push("<tr id='", rowTrId, "' tpath='", path, "' seq='",rowidx,"' pid='"+pid+"'");
				if (isexpand) {
					trhtml.push(" open='Y'");
				}else {
					trhtml.push(" style='display:none'");
				}
				if ((rowidx+1) % 2 && p.striped) {
					trhtml.push(" class='erow'");
				}
				trhtml.push(">");
				g.setTRHtmlTree(ths,thsdivs,trhtml,row,rowidx,deep,isend,isexpand);
				trhtml.push("</tr>");
	            //Child
	            if (row.hasChildren) {
	            	var len = row.childNodes.length;
	            	for (var k = 0; k < len; k++) {
	            		var childRow=row.childNodes[k];
	            		g.buildTreeRow(ths,thsdivs,trhtml,childRow,row[p.indexId], deep + 1, path + "_" + k, k == len - 1,isexpand);
	            	}
	            }
			},
			addRowData : function(row) {
				var trhtml=[];
				var ths = $('thead tr:first th', g.hDiv);
				var thsdivs = $('thead tr:first th div', g.hDiv);
				g.buildRow(ths,thsdivs,trhtml,row);
				var $tbody=$('tbody', $(t));
				if(!$tbody||$tbody.length==0){
					var tbhtml=[];
					tbhtml.push("<table cellpadding='0' cellspacing='0' border='0'><tbody>");
					tbhtml.push(trhtml.join(""));
					tbhtml.push("</tbody></table>");
					$(t).html(tbhtml.join(""));
					$tbody=$('tbody',$(t));
				}else{
					$tbody.append(trhtml.join(""));
				}
				var rowTrId="row"+(row[p.indexId]?row[p.indexId]:rowidx);
				var $rowTr=$("#"+rowTrId,$tbody);
				g.addRowProp.call($rowTr,row);
				if(!$rowTr.hasClass("trSelected")){
					$rowTr.addClass("trSelected");
				}
				$("input.itemchk", $rowTr).attr("checked",true);
				return $rowTr;
			},
			addRowDatas : function(rows) {
				if (rows) {
					$.each(rows, function(i, row) {
							g.addRowData(row);
					});
				}
			},
			editRowData : function(rowTr,row){
				var $editTr=$(rowTr);
				var rowIdx=$editTr.attr('seq');
				if(p.rowbinddata){
					$editTr.data(p.rowbinddataName,row);
				}
		        var ths = $('thead tr:first th', g.hDiv);
				var thsdivs = $('thead tr:first th div', g.hDiv);
				var trhtml=[];
				g.setTRHtml(ths,thsdivs,trhtml,row,rowIdx);
				$editTr.html(trhtml.join(""));
				$("input.itemchk", $editTr).each(function() {
						$(this).click(function() {
								if (this.checked) {
									$editTr.addClass("trSelected");
								} else {
									$editTr.removeClass("trSelected");
								}
								if (p.onrowchecked) {
									p.onrowchecked.call(this);
								}
						});
				});
				if(!$editTr.hasClass("trSelected")){
					$editTr.addClass("trSelected");
				}
				$("input.itemchk", $editTr).attr("checked",true);
			},
			getJsonValue:function(jsonObject,propertyName){
				if(!jsonObject||!propertyName)
					return null;
				if(propertyName.indexOf('.')!=-1){
					var value=jsonObject;
					var propertyNames=propertyName.split('.');
					for(var property in propertyNames){
						var p=propertyNames[property];
						value=value[p];
					   if(!value)
							return null;
					}
					return value;
				}
				return jsonObject[propertyName];
			},
			setTRHtml:function(ths,thsdivs,trHtml,row,rowIndex){//遍列表头,根据表头添加单元格数据.
				var rowIndex=rowIndex?rowIndex:rowidx;
				var tdhtml = [];
				$(ths).each(function(j) {
					var tdclass = [];
					tdhtml.push("<td align='", this.align, "'");
					var idx = $(this).attr('axis').substr(3);
					var colname = this.name;
					/*if (p.sortname && p.sortname == colname) {
						tdclass = 'sorted';
					}*/
					if (this.hide) {
						tdhtml.push(" style='display:none;'");
					}
					var width = thsdivs[j].style.width;
					var div = [];
					div.push("<div style='text-align:", this.align,";width:", width, ";");
					if (p.nowrap == false) {
						div.push("white-space:normal");
					}
					div.push("'>");
					if (idx == "-1") { // checkbox
						div.push("<input type='checkbox' id='chk_",row[p.indexId]?row[p.indexId]:rowIndex, "' class='itemchk' value='",row[p.indexId]?row[p.indexId]:rowIndex, "'/>");
						tdclass.push("chboxtd");
					}else if(idx=="-2"){
						div.push(rowIndex);
						tdclass.push("seq");
					} else {
						//var divInner = colname? (row[colname] || "&nbsp;"): "&nbsp;";
						var divInner = colname? (g.getJsonValue(row, colname) || null):null;
						if (this.process) {
							divInner = this.process(divInner, row);
						}
						div.push(divInner?divInner:"&nbsp;");
					}
					div.push("</div>");
					if (tdclass.length!= 0) {
						tdhtml.push(" class='", tdclass.join(" "), "'");
					}
					tdhtml.push(">", div.join(""), "</td>");
				});
				trHtml.push(tdhtml.join(""));
			},
			setTRHtmlTree:function(ths,thsdivs,trHtml,row,rowIndex,deep,isend,isexpand){//遍列表头,根据表头添加单元格数据.
				var rowIndex=rowIndex?rowIndex:rowidx;
				var tdhtml = [];
				var tdclass =[];
				ths.each(function(j) {
					tdclass.length = 0;
					tdhtml.push("<td align='", this.align?this.align:'center', "'");
					var idx = this.axis.substr(3);
					if (this.hide) {
						tdhtml.push(" style='display:none;'");
					}
					var width = thsdivs[j].style.width;
					var div = [];
					//process tree td
					var colname = this.name;
					if(p.tree&&colname&&p.treeFieldName==colname){
							tdclass.push("bbit-tree-node");
							div.push("<div style='text-align:left",";width:", width, ";");
							if (p.nowrap == false) {
								div.push("white-space:normal");
							}
							div.push("'>");
							div.push("<div");
				            var cs = [];
				            cs.push("bbit-tree-node-el");
				            if (row.hasChildren) {
				                cs.push(isexpand ? "bbit-tree-node-expanded" : "bbit-tree-node-collapsed");
				            }else{
				                cs.push("bbit-tree-node-leaf");
				            }
				            div.push(" class='", cs.join(" "), "'>");
				            div.push("<span class='bbit-tree-node-indent'>");
				            if (deep == 1) {
				            	div.push("<img class='bbit-tree-elbow-line' src='",p.iconspath,p.treebgif,"'/>");
				            } else if (deep > 1) {
				            	//div.push("<img class='bbit-tree-icon' src='",p.iconspath,p.treebgif,"'/>");
				                for (var j = 0; j < deep; j++) {
				                	div.push("<img class='bbit-tree-elbow-line' src='",p.iconspath,p.treebgif,"'/>");
				                }
				            }
				            div.push("</span>");
				            //img
				            cs.length = 0;
				            if (row.hasChildren) {
				                if (isexpand) {
				                    cs.push(isend ? "bbit-tree-elbow-end-minus" : "bbit-tree-elbow-minus");
				                }else {
				                    cs.push(isend ? "bbit-tree-elbow-end-plus" : "bbit-tree-elbow-plus");
				                }
				            }else {
				                cs.push(isend ? "bbit-tree-elbow-end" : "bbit-tree-elbow");
				            }
				            div.push("<img class='bbit-tree-ec-icon ", cs.join(" "), "' src='",p.iconspath,p.treebgif,"'/>");
				            div.push("<img class='bbit-tree-node-icon' src='",p.iconspath,p.treebgif,"'/>");
				           // div.push("<a hideFocus class='bbit-tree-node-anchor' tabIndex=1 href='javascript:void(0);'>");
							var divInner = colname? (g.getJsonValue(row, colname) || null):null;
							if (this.process) {
								divInner = this.process(divInner, row);
							}
				            //div.push("<span unselectable='on'>", divInner, "</span>");
				            div.push("<span class='text'>", divInner?divInner:"&nbsp;", "</span>");
				           // div.push("</a>");
				            div.push("</div>");
				            div.push("</div>");
						}else{
							div.push("<div style='text-align:", this.align,";width:", width, ";");
							if (p.nowrap == false) {
								div.push("white-space:normal");
							}
							div.push("'>");
							if (idx == "-1") { // checkbox
								div.push("<input type='checkbox' id='chk_",row[p.indexId]?row[p.indexId]:rowIndex, "' class='itemchk' value='",row[p.indexId]?row[p.indexId]:rowIndex, "'/>");
								tdclass.push("chboxtd");
							}else if(idx=="-2"){
								div.push(rowIndex);
								tdclass.push("seq");
								//tdclass.push("chboxtd");
							} else {
								//var divInner = colname? (row[colname] || "&nbsp;"): "&nbsp;";
								var divInner = colname? (g.getJsonValue(row, colname) || null):null;
								if (this.process) {
									divInner = this.process(divInner, row);
								}
								div.push(divInner?divInner:"&nbsp;");
							}
							div.push("</div>");
						}
						if (tdclass.length!= 0) {
							tdhtml.push(" class='", tdclass.join(" "), "'");
						}
						tdhtml.push(">", div.join(""), "</td>");
				});
				trHtml.push(tdhtml.join(""));
			},
			changeSort : function(th) { // change sortorder

				if (this.loading)
					return true;

				$(g.nDiv).hide();
				$(g.nBtn).hide();

				if (p.sortname == $(th).attr('abbr')) {
					if (p.sortorder == 'asc')
						p.sortorder = 'desc';
					else
						p.sortorder = 'asc';
				}

				$(th).addClass('sorted').siblings().removeClass('sorted');
				$('.sdesc', this.hDiv).removeClass('sdesc');
				$('.sasc', this.hDiv).removeClass('sasc');
				$('div', th).addClass('s' + p.sortorder);
				p.sortname = $(th).attr('abbr');

				if (p.onChangeSort)
					p.onChangeSort(p.sortname, p.sortorder);
				else
					this.populate();

			},
			buildpager : function() { // rebuild pager based on new properties
				if(!p.usepager){
					return;
				}
				$('.pcontrol input', this.pDiv).val(p.page);
				$('.pcontrol span', this.pDiv).html(p.pages);

				var r1 = (p.page - 1) * p.rp + 1;
				var r2 = r1 + p.rp - 1;

				if (p.total < r2)
					r2 = p.total;

				var stat = p.pagestat;

				stat = stat.replace(/{from}/, r1);
				stat = stat.replace(/{to}/, r2);
				stat = stat.replace(/{total}/, p.total);
				$('.pPageStat', this.pDiv).html(stat);
			},
			populate : function() { // get latest data
				if (this.loading)
					return true;
				if (p.onSubmit) {
					var gh = p.onSubmit();
					if (!gh)
						return false;
				}
				this.loading = true;
				if (!p.url)
					return false;
				$('.pPageStat', this.pDiv).html(p.procmsg);
				$('.pReload', this.pDiv).addClass('loading');
				$(g.block).css({
							top : g.bDiv.offsetTop
						});
				if (p.hideOnSubmit)
					$(this.gDiv).prepend(g.block); // $(t).hide();
				if ($.browser.opera)
					$(t).css('visibility', 'hidden');
				if (!p.newp)
					p.newp = 1;
				if (p.page > p.pages)
					p.page = p.pages;
				var param =this.populateParams();
				$.ajax({
							mode: "abort",
							port:   t.id+"_flexigrid_request",
							type : p.method,
							url : p.url,
							data : param,
							dataType : p.dataType,
							success : function(data) {
								if (data&&data.success) {
									if(p.onRequestSuccess){
										p.onRequestSuccess(data);
									}else{
										g.addData(data);
									}
								} else {
									if(data&&data.message)
										p.errormsg=data.message;
									if (p.onRequestError) {
										p.onRequestError(data);
									}
									g.hideLoading();
								}
							},
							error : function(data) {
								try {
									if (p.onRequestError) {
										p.onRequestError(data);
									} else {
										//alert("获取数据发生异常;");
									}
									g.hideLoading();
								} catch (e) {
								}
							}
						});
			},
            populateParams:function(){
            	if (!p.newp) p.newp = 1;
                if (p.page > p.pages) p.page = p.pages;
                var param = [
					  { name: 'page.pageNo', value: p.newp }
					, { name: 'page.pageSize', value: p.rp }
					//, { name: 'sortField', value: p.sortname }
					//, { name: 'sortOrder', value: p.sortorder }
					//, { name: 'query', value: p.query }
					//, { name: 'qtype', value: p.qtype }
					//, { name: 'qop', value: p.qop }
				];
                if(p.sortname&&p.sortorder){
                	param.push({ name: 'sortField', value: p.sortname });
                	param.push({ name: 'sortOrder', value: p.sortorder });
                }
                //add searchItem
                if(p.query&&p.qtype){
                	param.push({name: p.qtype, value: p.query });
                }
                if (p.extParam) {
                    for (var pi = 0; pi < p.extParam.length; pi++){
                    		param[param.length] = p.extParam[pi];
                    }
                }
                if (p.searchparam) {
                    var searchparams=p.searchparam.call(this);
                    for (var pi = 0; pi < searchparams.length; pi++){
                		param[param.length] =searchparams[pi];
                    }
                }
                return param;
            },
            checkSearchValue:function(){
				var queryType = $('select[name=qtype]', g.sDiv).val();
				var qArrType = queryType.split("$");
				var index = -1;
				if (qArrType.length != 3) {
					p.qop = "Eq";
					p.qtype = queryType;
				} else {
					p.qop = qArrType[1];
					p.qtype = qArrType[0];
					index = parseInt(qArrType[2]);
				}
				p.query = $('input[name=q]', g.sDiv).val();
            	// 添加验证代码
				if (p.query != "" && p.searchitems && index >= 0&& p.searchitems.length > index) {
					if (p.searchitems[index].reg) {
						if (!p.searchitems[index].reg.test(p.query)) {
							var error=$('<div class="error"/>');
							var element=$('input[name=q]', g.sDiv);
							var offset = element.offset();
							var top=offset.top+element.outerHeight()+1;
							var pos = ($.browser.msie && parseInt($.browser.version) <= 6 ) ? 'absolute' : 'fixed'; 
							var width=element.width();
							error.css({position: pos,zIndex:new Date().getTime(),top:top+'px',left:offset.left+'px',width:width,display:'block'});
							error.appendTo(element.parent()); 
							error.html(p.searchitems[index].errormsg?p.searchitems[index].errormsg:'输入不符合要求');
							if ($.fn.bgiframe)
								error.bgiframe(); 
							return false;
						}
					}
				}
				$('div.error',g.sDiv).remove();
				return true;
            },
			doSearch : function() {
				if(!this.checkSearchValue()){
					return false;
				}
				p.newp = 1;
				this.populate();
			},
			changePage : function(ctype) { // change page

				if (this.loading)
					return true;

				switch (ctype) {
					case 'first' :
						p.newp = 1;
						break;
					case 'prev' :
						if (p.page > 1)
							p.newp = parseInt(p.page) - 1;
						break;
					case 'next' :
						if (p.page < p.pages)
							p.newp = parseInt(p.page) + 1;
						break;
					case 'last' :
						p.newp = p.pages;
						break;
					case 'input' :
						var nv = parseInt($('.pcontrol input', this.pDiv).val());
						if (isNaN(nv))
							nv = 1;
						if (nv < 1)
							nv = 1;
						else if (nv > p.pages)
							nv = p.pages;
						$('.pcontrol input', this.pDiv).val(nv);
						p.newp = nv;
						break;
				}

				if (p.newp == p.page)
					return false;
				if (p.onChangePage)
					p.onChangePage(p.newp);
				else
					this.populate();

			},
			cellProp : function(n, ptr, pth) {
				var tdDiv = document.createElement('div');
				if (pth != null) {
					if (p.sortname == $(pth).attr('abbr') && p.sortname) {
						this.className = 'sorted';
					}
					$(tdDiv).css({
								textAlign : pth.align,
								width : $('div:first', pth)[0].style.width
							});
					if (pth.hide)
						$(this).css('display', 'none');
				}
				if (p.nowrap == false)
					$(tdDiv).css('white-space', 'normal');

				if (this.innerHTML == '')
					this.innerHTML = '&nbsp;';

				// tdDiv.value = this.innerHTML; //store preprocess value
				tdDiv.innerHTML = this.innerHTML;

				var prnt = $(this).parent()[0];
				var pid = false;
				if (prnt.id)
					pid = prnt.id.substr(3);
				if (pth != null) {
					if (pth.process) {
						pth.process(tdDiv, pid);
					}
				}
				$("input.itemchk", tdDiv).each(function() {
							$(this).click(function() {
										if (this.checked) {
											$(ptr).addClass("trSelected");
										} else {
											$(ptr).removeClass("trSelected");
										}
										if (p.onrowchecked) {
											p.onrowchecked.call(this);
										}
									});
						});
				$(this).empty().append(tdDiv).removeAttr('width'); // wrap
				// content
				// add editable event here 'dblclick',如果需要可编辑在这里添加可编辑代码
			},
			addCellProp : function() {
				var $gF = this.cellProp;
				$('tbody tr td', g.bDiv).each(function() {
							var n = $('td', $(this).parent()).index(this);
							var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
							var ptr = $(this).parent();
							$gF.call(this, n, ptr, pth);
						});
				$gF = null;
			},
			getCheckedRows : function() {
				var ids = [];
				$(":checkbox:checked", g.bDiv).each(function() {
							ids.push($(this).val());
						});
				return ids;
			},
			getCellDim : function(obj) // get cell prop for editable event
			{
				var ht = parseInt($(obj).height());
				var pht = parseInt($(obj).parent().height());
				var wt = parseInt(obj.style.width);
				var pwt = parseInt($(obj).parent().width());
				var top = obj.offsetParent.offsetTop;
				var left = obj.offsetParent.offsetLeft;
				var pdl = parseInt($(obj).css('paddingLeft'));
				var pdt = parseInt($(obj).css('paddingTop'));
				return {ht : ht,wt : wt,top : top,left : left,pdl : pdl,pdt : pdt,pht : pht,pwt : pwt};
			},
			addRowProp : function(row) {
				var $rowTr=$(this);
				$("input.itemchk", $rowTr).each(function() {
						$(this).click(function() {
								if (this.checked) {
									$rowTr.addClass("trSelected");
								} else {
									$rowTr.removeClass("trSelected");
								}
								if (p.onrowchecked) {
									p.onrowchecked.call(this);
								}
						});
				});
				if(p.rowbinddata){
					$rowTr.data(p.rowbinddataName,row);
				}
				if (p.rowhandler) {
					p.rowhandler(this);
				}
				if (p.onRowDblclick) {
					$(this).dblclick(function() {
						p.onRowDblclick(this,row);
					});
				}
				if(p.onRowClick){
					$(this).click(function() {
						p.onRowClick(this,row);
					});
				}
                //if ($.browser.msie && $.browser.version < 7.0) {
                    $(this).hover(function() {$('tbody tr', g.bDiv).removeClass('trOver');$(this).addClass('trOver'); }, function() { $(this).removeClass('trOver'); });
              //  }
			},
			addRowProps : function(rows) {
				$('tbody tr', g.bDiv).each(
                    function(i) {
                    	 g.addRowProp.call(this,rows[i]);
                    }
                );
				// $gF = null;
			},
			getListItems:function(){
				return $('tbody tr', g.bDiv);
			},
			checkAllOrNot : function(parent) {
				var ischeck = $(this).attr("checked");
				$('tbody tr', g.bDiv).each(function() {
							if (ischeck) {
								$(this).addClass("trSelected");
							} else {
								$(this).removeClass("trSelected");
							}
							$("input:checkbox.itemchk", $(this)).each(function() {
								this.checked = ischeck;
								// Raise Event
								if (p.onrowchecked) {
									p.onrowchecked.call(this);
								}
							});
						});
			},
			pager : 0
		};

		// create model if any
		if (p.colModel) {
			thead = document.createElement('thead');
			tr = document.createElement('tr');
			// p.showcheckbox ==true;
			if (p.showcheckbox) {
				var th = document.createElement('th');
				$(th).addClass("cth");
				th.axis="col-1";
				th.align ='center';
				$(th).attr({width : "15","isch" : true});
				var cthch = $('<input type="checkbox" class="chk"/>');
				//cthch.addClass("noborder");
				$(th).append(cthch);
				$(tr).append(th);
			}
			if(p.showseq){
				var cth = jQuery('<th/>');
				cth.html(p.seqdisplayName);
				cth.addClass("seq").attr({'axis' : "col-2",width : "22"});
				$(tr).append(cth);
			}
			for (i = 0; i < p.colModel.length; i++) {
				var cm = p.colModel[i];
				var th = document.createElement('th');

				th.innerHTML = cm.display;

				if (cm.name && cm.sortable)
					$(th).attr('abbr', cm.name);

				$(th).attr('axis', 'col' + i);

				if (cm.align)
					th.align = cm.align;
					
				if(cm.name)
					th.name=cm.name;
					
				if (cm.width)
					$(th).attr('width', cm.width);

				if (cm.hide) {
					th.hide = true;
				}
				if (cm.toggle != undefined) {
					th.toggle = cm.toggle;
				}
				if (cm.process) {
					th.process = cm.process;
				}

				$(tr).append(th);
			}
			$(thead).append(tr);
			$(t).prepend(thead);
		} // end if p.colModel

		// init divs
		g.gDiv = document.createElement('div'); // create global container
		g.mDiv = document.createElement('div'); // create title container
		g.hDiv = document.createElement('div'); // create header container
		//g.bDiv = document.createElement('div'); // create body container
		g.bDiv = t;
		g.vDiv = document.createElement('div'); // create grip
		g.rDiv = document.createElement('div'); // create horizontal resizer
		g.cDrag = document.createElement('div'); // create column drag
		g.block = document.createElement('div'); // creat blocker
		g.nDiv = document.createElement('div'); // create column show/hide popup
		g.nBtn = document.createElement('div'); // create column show/hide
		// button
		g.iDiv = document.createElement('div'); // create editable layer
		g.tDiv = document.createElement('div'); // create toolbar
		g.sDiv = document.createElement('div');

		if (p.usepager)
			g.pDiv = document.createElement('div'); // create pager
		// container
		g.hTable = document.createElement('table');

		// set gDiv
		g.gDiv.className = p.gridClass;
		if (p.width != 'auto')
			g.gDiv.style.width = p.width + 'px';

		// add conditional classes
		if ($.browser.msie)
			$(g.gDiv).addClass('ie');

		if (p.novstripe)
			$(g.gDiv).addClass('novstripe');

		$(t).before(g.gDiv);
		$(g.gDiv).append(t);

		// set toolbar
		if (p.buttons) {
			g.tDiv.className = 'tDiv';
			var tDiv2 = document.createElement('div');
			tDiv2.className = 'tDiv2';

			for (i = 0; i < p.buttons.length; i++) {
				var btn = p.buttons[i];
				if (!btn.separator) {
					var btnDiv = document.createElement('div');
					btnDiv.className = 'fbutton';
					btnDiv.innerHTML = "<div><span>" + btn.displayname
							+ "</span></div>";
					if (btn.title) {
						btnDiv.title = btn.title;
					}
					if (btn.bclass)
						$('span', btnDiv).addClass(btn.bclass);
					btnDiv.onpress = btn.onpress;
					btnDiv.name = btn.name;
					if (btn.onpress) {
						$(btnDiv).click(function() {
									this.onpress(this.name, g.gDiv);
								});
					}
					$(tDiv2).append(btnDiv);
					if ($.browser.msie && $.browser.version < 7.0) {
						$(btnDiv).hover(function() {
									$(this).addClass('fbOver');
								}, function() {
									$(this).removeClass('fbOver');
								});
					}

				} else {
					$(tDiv2).append("<div class='btnseparator'></div>");
				}
			}
			$(g.tDiv).append(tDiv2);
			$(g.tDiv).append("<div style='clear:both'></div>");
			$(g.gDiv).prepend(g.tDiv);
		}

		// set hDiv
		g.hDiv.className = 'hDiv';

		$(t).before(g.hDiv);

		// set hTable
		g.hTable.cellPadding = 0;
		g.hTable.cellSpacing = 0;
		$(g.hDiv).append('<div class="hDivBox"></div>');
		$('div', g.hDiv).append(g.hTable);
		var thead = $("thead:first", t).get(0);
		if (thead)
			$(g.hTable).append(thead);
		thead = null;

		if (!p.colModel)
			var ci = 0;

		// setup thead
		$('thead tr:first th', g.hDiv).each(function() {
			var thdiv = document.createElement('div');
			if ($(this).attr('abbr')) {
				$(this).click(function(e) {
							if (!$(this).hasClass('thOver'))
								return false;
							var obj = (e.target || e.srcElement);
							if (obj.href || obj.type)
								return true;
							g.changeSort(this);
						});

				if ($(this).attr('abbr') == p.sortname) {
					this.className = 'sorted';
					thdiv.className = 's' + p.sortorder;
				}
			}

			if (this.hide)
				$(this).hide();

			if (!p.colModel && !$(this).attr("isch")) {
				$(this).attr('axis', 'col' + ci++);
			}

			$(thdiv).css({
						textAlign : this.align,
						width : this.width + 'px'
					});
			thdiv.innerHTML = this.innerHTML;

			$(this).empty().append(thdiv).removeAttr('width');
			var idx = $(this).attr('axis').substr(3);
			if ((idx != '-1') && (idx != '-2')) {
				$(this).mousedown(function(e) {
							g.dragStart('colMove', e, this);
						}).hover(function() {

					if (!g.colresize && !$(this).hasClass('thMove')
							&& !g.colCopy)
						$(this).addClass('thOver');

					if ($(this).attr('abbr') != p.sortname && !g.colCopy
							&& !g.colresize && $(this).attr('abbr'))
						$('div', this).addClass('s' + p.sortorder);
					else if ($(this).attr('abbr') == p.sortname && !g.colCopy
							&& !g.colresize && $(this).attr('abbr')) {
						var no = '';
						if (p.sortorder == 'asc')
							no = 'desc';
						else
							no = 'asc';
						$('div', this).removeClass('s' + p.sortorder)
								.addClass('s' + no);
					}

					if (g.colCopy) {

						var n = $('th', g.hDiv).index(this);

						if (n == g.dcoln)
							return false;

						if (n < g.dcoln)
							$(this).append(g.cdropleft);
						else
							$(this).append(g.cdropright);

						g.dcolt = n;

					} else if (!g.colresize) {
						var thsa = $('th:visible', g.hDiv);
						var nv = -1;
						for (var i = 0, j = 0, l = thsa.length; i < l; i++) {
							if ($(thsa[i]).css("display") != "none") {
								if (thsa[i] == this) {
									nv = j;
									break;
								}
								j++;
							}
						}
						var onl = parseInt($('div:eq(' + nv + ')', g.cDrag)
								.css('left'));
						var nw = parseInt($(g.nBtn).width())
								+ parseInt($(g.nBtn).css('borderLeftWidth'));
						nl = onl - nw + Math.floor(p.cgwidth / 2);

						$(g.nDiv).hide();
						$(g.nBtn).hide();

						$(g.nBtn).css({
									'left' : nl,
									top : g.hDiv.offsetTop
								}).show();

						var ndw = parseInt($(g.nDiv).width());

						$(g.nDiv).css({
									top : g.bDiv.offsetTop
								});

						if ((nl + ndw) > $(g.gDiv).width())
							$(g.nDiv).css('left', onl - ndw + 1);
						else
							$(g.nDiv).css('left', nl);

						if ($(this).hasClass('sorted'))
							$(g.nBtn).addClass('srtd');
						else
							$(g.nBtn).removeClass('srtd');

					}

				}, function() {
					$(this).removeClass('thOver');
					if ($(this).attr('abbr') != p.sortname)
						$('div', this).removeClass('s' + p.sortorder);
					else if ($(this).attr('abbr') == p.sortname) {
						var no = '';
						if (p.sortorder == 'asc')
							no = 'desc';
						else
							no = 'asc';

						$('div', this).addClass('s' + p.sortorder)
								.removeClass('s' + no);
					}
					if (g.colCopy) {
						$(g.cdropleft).remove();
						$(g.cdropright).remove();
						g.dcolt = null;
					}
				}); // wrap content
			}
		});

		// set bDiv
		g.bDiv.className = 'bDiv';
		//$(t).before(g.bDiv);
		$(g.bDiv).css({
					height : (p.height == 'auto') ? 'auto' : p.height + "px"
				}).scroll(function(e) {
					g.scroll();
				});//.append(t);

		if (p.height == 'auto') {
			$('table', g.bDiv).addClass('autoht');
		}

		// add td properties
		if (p.url == false || p.url == "") {
			//g.addCellProp();
			// add row properties
			//g.addRowProps();
		}

		// set cDrag

		var cdcol = $('thead tr:first th:first', g.hDiv).get(0);

		if (cdcol != null) {
			g.cDrag.className = 'cDrag';
			g.cdpad = 0;

			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth')))
					? 0
					: parseInt($('div', cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth')))
					? 0
					: parseInt($('div', cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft')))
					? 0
					: parseInt($('div', cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight')))
					? 0
					: parseInt($('div', cdcol).css('paddingRight')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth')))
					? 0
					: parseInt($(cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth')))
					? 0
					: parseInt($(cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft')))
					? 0
					: parseInt($(cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight')))
					? 0
					: parseInt($(cdcol).css('paddingRight')));

			$(g.bDiv).before(g.cDrag);

			var cdheight = $(g.bDiv).height();
			var hdheight = $(g.hDiv).height();

			$(g.cDrag).css({
						top : -hdheight + 'px'
					});

			$('thead tr:first th', g.hDiv).each(function() {
						var cgDiv = document.createElement('div');
						$(g.cDrag).append(cgDiv);
						if (!p.cgwidth)
							p.cgwidth = $(cgDiv).width();
						$(cgDiv).css({
									height : cdheight + hdheight
								}).mousedown(function(e) {
									g.dragStart('colresize', e, this);
								});
						if ($.browser.msie && $.browser.version < 7.0) {
							g.fixHeight($(g.gDiv).height());
							$(cgDiv).hover(function() {
										g.fixHeight();
										$(this).addClass('dragging');
									}, function() {
										if (!g.colresize)
											$(this).removeClass('dragging');
									});
						}
					});

			// g.rePosDrag();

		}

		// add strip
		if (p.striped)
			$('tbody tr:odd', g.bDiv).addClass('erow');

		if (p.resizable && p.height != 'auto') {
			g.vDiv.className = 'vGrip';
			$(g.vDiv).mousedown(function(e) {
						g.dragStart('vresize', e);
					}).html('<span></span>');
			$(g.bDiv).after(g.vDiv);
		}

		if (p.resizable && p.width != 'auto' && !p.nohresize) {
			g.rDiv.className = 'hGrip';
			$(g.rDiv).mousedown(function(e) {
						g.dragStart('vresize', e, true);
					}).html('<span></span>').css('height', $(g.gDiv).height());
			if ($.browser.msie && $.browser.version < 7.0) {
				$(g.rDiv).hover(function() {
							$(this).addClass('hgOver');
						}, function() {
							$(this).removeClass('hgOver');
						});
			}
			$(g.gDiv).append(g.rDiv);
		}

		// add pager
		if (p.usepager) {
			g.pDiv.className = 'pDiv';
			g.pDiv.innerHTML = '<div class="pDiv2"></div>';
			$(g.bDiv).after(g.pDiv);
			var html = '<div class="pGroup"><div class="pFirst pButton" title="转到第一页"><span></span></div><div class="pPrev pButton" title="转到上一页"><span></span></div> </div><div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">当前第 <input type="text" size="1" value="1" class="pNum"/> 页,共<span>1</span>页</span></div><div class="btnseparator"></div><div class="pGroup"> <div class="pNext pButton" title="转到下一页"><span></span></div><div class="pLast pButton" title="转到最后一页"><span></span></div></div><div class="btnseparator"></div><div class="pGroup"> <div class="pReload pButton" title="刷新"><span></span></div> </div> <div class="btnseparator"></div><div class="pGroup"><span class="pPageStat"></span></div>';
			$('div', g.pDiv).html(html);

			$('.pReload', g.pDiv).click(function() {
						g.populate();
					});
			$('.pFirst', g.pDiv).click(function() {
						g.changePage('first');
					});
			$('.pPrev', g.pDiv).click(function() {
						g.changePage('prev');
					});
			$('.pNext', g.pDiv).click(function() {
						g.changePage('next');
					});
			$('.pLast', g.pDiv).click(function() {
						g.changePage('last');
					});
			$('.pcontrol input', g.pDiv).keydown(function(e) {
						if (e.keyCode == 13)
							g.changePage('input');
					});
			if ($.browser.msie && $.browser.version < 7)
				$('.pButton', g.pDiv).hover(function() {
							$(this).addClass('pBtnOver');
						}, function() {
							$(this).removeClass('pBtnOver');
						});

			if (p.useRp) {
				var opt = "";
				for (var nx = 0; nx < p.rpOptions.length; nx++) {
					if (p.rp == p.rpOptions[nx])
						sel = 'selected="selected"';
					else
						sel = '';
					opt += "<option value='" + p.rpOptions[nx] + "' " + sel
							+ " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
				};
				$('.pDiv2', g.pDiv)
						.prepend("<div class='pGroup'>每页 <select name='rp'>"
								+ opt
								+ "</select> 条</div> <div class='btnseparator'></div>");
				$('select', g.pDiv).change(function() {
							if (p.onRpChange)
								p.onRpChange(+this.value);
							else {
								p.newp = 1;
								p.rp = +this.value;
								g.populate();
							}
						});
			}

			// add search button
			if (p.searchitems) {
				$('.pDiv2', g.pDiv)
						.prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
				$('.pSearch', g.pDiv).click(function() {
					$(g.sDiv).slideToggle('fast', function() {
						$('.sDiv:visible input:first', g.gDiv).trigger('focus');
					});
				});
				// add search box
				g.sDiv.className = 'sDiv';
				sitems = p.searchitems;
				var sopt = "";
				var op = "Eq";
				for (var s = 0; s < sitems.length; s++) {
					if (p.qtype == '' && sitems[s].isdefault == true) {
						p.qtype = sitems[s].name;
						sel = 'selected="selected"';
					} else
						sel = '';
					if (sitems[s].operater == "Like") {
						op = "Like";
					} else {
						op = "Eq";
					}
					sopt += "<option value='" + sitems[s].name + "$" + op + "$"+ s + "' " + sel + " >" + sitems[s].display+ "&nbsp;&nbsp;</option>";
				}

				if (p.qtype == '')
					p.qtype = sitems[0].name;

				$(g.sDiv).append("<div class='sDiv2'><select name='qtype'>"
								+ sopt
								+ "</select>&nbsp;<input type='text' size='30' name='q' class=' text' /> <input type='button' name='qsearchbtn' class='button' value='查询' /> <input type='button' name='qclearbtn' class='button' value='清空' /></div>");

				$('input[name=q],select[name=qtype]', g.sDiv).keydown(
						function(e) {
							if (e.keyCode == 13)
								g.doSearch();
				});
				$('input[name=qclearbtn]', g.sDiv).click(function() {
							$('input[name=q]', g.sDiv).val('');
							p.query = '';
							g.doSearch();
						});
				$('input[name=qsearchbtn]', g.sDiv).click(function() {
					g.doSearch();
				});
				if(p.searchShow=='top'){
					$(g.hDiv).before(g.sDiv);
				}else{
					$(g.bDiv).after(g.sDiv);
				}
				if(p.searchDisplay){
					g.sDiv.style.display='block';
				}
			}

		}
		$(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");

		// add title
		if (p.title) {
			g.mDiv.className = 'mDiv';
			g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
			$(g.gDiv).prepend(g.mDiv);
			if (p.showTableToggleBtn) {
				$(g.mDiv)
						.append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
				$('div.ptogtitle', g.mDiv).click(function() {
							$(g.gDiv).toggleClass('hideBody');
							$(this).toggleClass('vsble');
						});
			}
			// g.rePosDrag();
		}

		// setup cdrops
		g.cdropleft = document.createElement('span');
		g.cdropleft.className = 'cdropleft';
		g.cdropright = document.createElement('span');
		g.cdropright.className = 'cdropright';

		// add block
		g.block.className = 'gBlock';
		var blockloading = $("<div/>");
		blockloading.addClass("loading");
		$(g.block).append(blockloading);
		var gh = $(g.bDiv).height();
		var gtop = g.bDiv.offsetTop;
		$(g.block).css({
					width : g.bDiv.style.width,
					height : gh,
					position : 'relative',
					marginBottom : (gh * -1),
					zIndex : 1,
					top : gtop,
					left : '0px'
				});
		$(g.block).fadeTo(0, p.blockOpacity);

		// add column control
		if ($('th', g.hDiv).length) {
			g.nDiv.className = 'nDiv';
			g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			$(g.nDiv).css({
						marginBottom : (gh * -1),
						display : 'none',
						top : gtop
					}).noSelect();

			var cn = 0;

			$('th div', g.hDiv).each(function() {
				var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
				if (kcol == null)
					return;
				if(this.innerHTML==p.seqdisplayName){
					return;
				}
				var chkall = $("input[type='checkbox']", this);
				if (chkall.length > 0) {
					chkall[0].onclick = g.checkAllOrNot;
					return;
				}
				if (kcol.toggle == false || this.innerHTML == "") {
					cn++;
					return;
				}
				var chk = 'checked="checked"';
				if (kcol.style.display == 'none')
					chk = '';

				$('tbody', g.nDiv)
						.append('<tr><td class="ndcol1"><input type="checkbox" '
								+ chk
								+ ' class="togCol noborder" value="'
								+ cn
								+ '" /></td><td class="ndcol2">'
								+ this.innerHTML + '</td></tr>');
				cn++;
			});

			if ($.browser.msie && $.browser.version < 7.0)
				$('tr', g.nDiv).hover(function() {
							$(this).addClass('ndcolover');
						}, function() {
							$(this).removeClass('ndcolover');
						});

			$('td.ndcol2', g.nDiv).click(function() {
				if ($('input:checked', g.nDiv).length <= p.minColToggle
						&& $(this).prev().find('input')[0].checked)
					return false;
				return g.toggleCol($(this).prev().find('input').val());
			});

			$('input.togCol', g.nDiv).click(function() {

				if ($('input:checked', g.nDiv).length < p.minColToggle
						&& this.checked == false)
					return false;
				$(this).parent().next().trigger('click');
					// return false;
			});

			$(g.gDiv).prepend(g.nDiv);

			$(g.nBtn).addClass('nBtn').html('<div></div>')
					// .attr('title', 'Hide/Show Columns')
					.click(function() {
								$(g.nDiv).toggle();
								return true;
							});

			if (p.showToggleBtn)
				$(g.gDiv).prepend(g.nBtn);

		}

		// add date edit layer
		$(g.iDiv).addClass('iDiv').css({
					display : 'none'
				});
		$(g.bDiv).append(g.iDiv);

		// add flexigrid events
		$(g.bDiv).hover(function() {
					$(g.nDiv).hide();
					$(g.nBtn).hide();
				}, function() {
					if (g.multisel)
						g.multisel = false;
				});
		$(g.gDiv).hover(function() {
				}, function() {
					$(g.nDiv).hide();
					$(g.nBtn).hide();
				});

		// add document events
		$(document).mousemove(function(e) {
					g.dragMove(e);
				}).mouseup(function(e) {
					g.dragEnd();
				}).hover(function() {
				}, function() {
					g.dragEnd();
				});

		// browser adjustments
		if ($.browser.msie && $.browser.version < 7.0) {
			$('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
						width : '100%'
					});
			$(g.gDiv).addClass('ie6');
			if (p.width != 'auto')
				$(g.gDiv).addClass('ie6fullwidthbug');
		}

		g.rePosDrag();
		g.fixHeight();

		// make grid functions accessible
		t.p = p;
		t.grid = g;

		// load data
		if (p.url && p.autoload) {
			g.populate();
		}

		return t;

	};

	var docloaded = false;

	$(document).ready(function() {
				docloaded = true;
			});

	$.fn.flexigrid = function(p) {
		return this.each(function() {
					if (!docloaded) {
						$(this).hide();
						var t = this;
						$(document).ready(function() {
									$.addFlex(t, p);
								});
					} else {
						$.addFlex(this, p);
					}
				});

	}; // end flexigrid

	$.fn.flexReload = function(setting) { // function to reload grid
		return this.each(function() {
					jQuery.extend(this.p, setting);
					if (this.grid && this.p.url)
						this.grid.populate();
				});

	}; // end flexReload
    $.fn.getParamsString = function(){
    	/*if (this[0].grid) {
			return $.param(this[0].grid.populateParams());
		}*/
		var paramString="";
     	if (this[0].grid) {
            var param=this[0].grid.populateParams();
            var len=param.length;
            for (var i=0;i<len;i++) 
            { 
            	if(param[i].value){
                	if(i!=0){
                		paramString+="&";
                	}
                	paramString+=param[i].name+"="+encodeURIComponent(param[i].value);
            	}
            }
        }
        return paramString;
    },
	// 重新指定宽度和高度
	$.fn.flexResize = function(w, h) {
		var p = {
			width : w,
			height : h
		};
		return this.each(function() {
					if (this.grid) {
						$.extend(this.p, p);
						this.grid.reSize();
					}
				});
	};
	$.fn.changePage = function(type) {
		return this.each(function() {
					if (this.grid) {
						this.grid.changePage(type);
					}
				});
	};
	$.fn.flexOptions = function(p) { // function to update general options
		return this.each(function() {
					if (this.grid)
						$.extend(this.p, p);
				});

	}; // end flexOptions
	$.fn.getOptions = function() {
		if (this[0].grid) {
			return this[0].p;
		}
		return null;
	};
	$.fn.getIndexId=function(){
		if (this[0].grid) {
			return this[0].p.indexId;
		}
		return null;
	};
	//根据ID获取行节点对象
	$.fn.getRowDom=function(id){
		if (this[0].grid) {
			 return $('#row' + id, grid);
		}
		return null;
	};
	$.fn.getCheckedRows = function() {
		if (this[0].grid) {
			return this[0].grid.getCheckedRows();
		}
		return [];
	};
	$.fn.flexToggleCol = function(cid, visible) { // function to reload grid
		return this.each(function() {
					if (this.grid)
						this.grid.toggleCol(cid, visible);
				});

	}; // end flexToggleCol

	$.fn.flexAddData = function(data) { // function to add data to grid
		return this.each(function() {
					if (this.grid)
						this.grid.addData(data);
				});
	};
	$.fn.flexAddRowData = function(row) {
		return this.each(function() {
					if (this.grid){
						this.grid.addRowData(row);
					}
				});
	};
	$.fn.flexEditRowData = function(rowtr,row) {
		return this.each(function() {
					if (this.grid)
						this.grid.editRowData(rowtr,row);
				});
	};
	$.fn.noSelect = function(p) { // no select plugin by me :-)
		if (p == null)
			prevent = true;
		else
			prevent = p;

		if (prevent) {

			return this.each(function() {
						if ($.browser.msie || $.browser.safari)
							$(this).bind('selectstart', function() {
										return false;
									});
						else if ($.browser.mozilla) {
							$(this).css('MozUserSelect', 'none');
							$('body').trigger('focus');
						} else if ($.browser.opera)
							$(this).bind('mousedown', function() {
										return false;
									});
						else
							$(this).attr('unselectable', 'on');
					});
		} else {

			return this.each(function() {
						if ($.browser.msie || $.browser.safari)
							$(this).unbind('selectstart');
						else if ($.browser.mozilla)
							$(this).css('MozUserSelect', 'inherit');
						else if ($.browser.opera)
							$(this).unbind('mousedown');
						else
							$(this).removeAttr('unselectable', 'on');
					});
		}

	}; // end noSelect

})(jQuery);