Tea.context(function () {
    var that = this;

    this.charts = [];

    this.$delay(function () {
        this.loadCharts();

        if (this.boardType == "realtime") {
			this.serversSortable();
		}
    });

    this.widgetIsLoaded = false;
    this.widgetError = "";
    this.events = [];

    this.loadCharts = function () {
        this.$post("/proxy/board")
            .params({
                "serverId": this.server.id,
				"type": this.boardType,
				"events": JSON.stringify(this.events)
            })
            .timeout(10)
			.success(function (resp) {
				// output
				if (resp.data.output != null) {
					resp.data.output.$each(function (k, v) {
						console.log("[widget]" + v);
					});
				}

				// charts
				this.charts = resp.data.charts;
				var that = this;
				new ChartRender(this.charts, function (events) {
					that.events = events;
					that.loadCharts();
				});
			})
			.fail(function (resp) {
				throw new Error("[widget]" + resp.message);
			})
			.done(function () {
				this.$delay(function () {
					this.widgetIsLoaded = true;
				}, 500);

				if (this.boardType == "realtime") {
					this.$delay(function () {
						this.loadCharts();
					}, 5000);
				}

				//this.events = [];
			});
    };

	/**
	 * 左侧菜单排序
	 */
	this.serversSortable = function () {
		var box = this.$find(".sub-menu div")[0];
		var that = this;
		Sortable.create(box, {
			draggable: "a.item.sortable",
			onStart: function () {

			},
			onUpdate: function (event) {
				var newIndex = event.newIndex;
				var oldIndex = event.oldIndex;
				that.$post("/proxy/move")
					.params({
						"fromIndex": oldIndex,
						"toIndex": newIndex
					});
			}
		});
	};
});