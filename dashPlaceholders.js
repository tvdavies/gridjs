var placeholders = (function (window) {

	var placeholdersGroup;
	var placeholdersGroupX;
	var document;
	var svg;
	var svgNS;
	var mimicFrame;
	var maxWidth;
	var placeholderWidth = 100;
	var placeholderHeight = 100;
	var margin = 10;
	var placeholderRows = [];
	var draggedOverPlaceholder = null;

	var strokeColor = '#DDDDDD';
	var highlightStrokeColor = '#66FF99';

	function PlaceholderRow(y, previousRow) {
		var self = this;
		this.id = previousRow ? previousRow.id + 1 : 1;
		this.height = placeholderHeight;
		this.positionChangedListeners = [];
		this.heightChangedListeners = [];
		this.placeholders = [];
		this.transform = "";
		this.scale = "";
		this.scaleFactor = 1;

		this.g = document.createElementNS(svgNS, "g");
		this.g.setAttribute("id", "placeholder-row-" + this.id);
		this.setY(y);
		this.previousRow = previousRow;

		this.positionChangedListener = function (y) {
			self.setY(y);
		};

		if (previousRow) {
			previousRow.setNextRow(this);
			// We will be notified when the previous row causes us to shuffle up or down
			previousRow.addPositionChangedListener(this.positionChangedListener);
		}
	}

	PlaceholderRow.prototype.yCollide = function (y) {
		var lowerBound = this.y;
		var upperBound = this.y + (this.height * this.scaleFactor);

		if (y >= lowerBound && y <= upperBound) {
			// System.out.println("y: " + y + ", lowerBound: " + lowerBound + ", upperBound: " + upperBound);
			return true;
		}

		return false;
	};

	PlaceholderRow.prototype.setNextRow = function (row) {
		this.nextRow = row;
	};

	PlaceholderRow.prototype.getElement = function () {
		return this.g;
	};

	PlaceholderRow.prototype.addPlaceholder = function () {
		var previous;
		var x = 0;

		if (this.placeholders.length > 0) {
			previous = this.placeholders[this.placeholders.length - 1];
			x = previous.x + previous.width + margin;
		}

		var placeholder = new Placeholder(x, this.height, previous, this);
		this.placeholders.push(placeholder);
		this.g.appendChild(placeholder.getElement());
		this.setScaleToFit();

		return placeholder;
	};

	PlaceholderRow.prototype.removePlaceholder = function (placeholder) {
		var i = this.placeholders.findIndex(function (val) {
			return val.id === placeholder.id;
		});

		if (i > -1) {
			this.placeholders.splice(i, 1);
		}

		this.setScaleToFit();
	};

	PlaceholderRow.prototype.setScaleToFit = function () {
		// If this has taken us beyond the max width, then scale row down until
		// the row's width is less than the max width.
		// Will then notify the next row that the position has changed.
		//
		var lastPlaceholder = this.placeholders[this.placeholders.length - 1];
		var rowWidth = lastPlaceholder.x + lastPlaceholder.width;

		if (rowWidth > maxWidth) {
			this.scaleFactor = (maxWidth / rowWidth);
			this.scale = "scale(" + this.scaleFactor + ")";
		} else {
			this.scaleFactor = 1;
			this.scale = "";
		}

		this.updateTransform();
	};

	PlaceholderRow.prototype.setTranslate = function (translate) {
		this.translate = translate;
		this.updateTransform();
	};

	PlaceholderRow.prototype.updateTransform = function () {
		System.out.println(this.translate + " " + this.scale);
		this.g.setAttribute("transform", this.translate + " " + this.scale);
		this.notifyPositionChangedListeners();
	};

	PlaceholderRow.prototype.setY = function (y) {
		this.y = y;
		this.setTranslate("translate(0," + this.y + ")");
	};

	PlaceholderRow.prototype.setHeight = function (height) {
		this.height = height;
		this.notifyPositionChangedListeners();
		this.notifyHeightChangedListeners();
	};

	PlaceholderRow.prototype.notifyPositionChangedListeners = function () {
		var self = this;
		this.positionChangedListeners.forEach(function (listener) {
			// Send the new y position for the next row
			var pos = self.y + (self.height * self.scaleFactor) + margin;
			listener(pos);
		});
	};

	PlaceholderRow.prototype.notifyHeightChangedListeners = function () {
		var self = this;
		this.heightChangedListeners.forEach(function (listener) {
			// Send the height to resize each placeholder on the row
			listener(self.height * self.scaleFactor);
		});
	};

	PlaceholderRow.prototype.addPositionChangedListener = function (listener) {
		this.positionChangedListeners.push(listener);
	};

	PlaceholderRow.prototype.removePositionChangedListener = function (listener) {
		this.positionChangedListeners = this.positionChangedListeners.filter(function (val) {
			val !== listener;
		});
	};

	PlaceholderRow.prototype.addHeightChangedListener = function (listener) {
		this.heightChangedListeners.push(listener);
	};

	PlaceholderRow.prototype.removeHeightChangedListener = function (listener) {
		this.heightChangedListeners = this.heightChangedListeners.filter(function (val) {
			val !== listener;
		});
	};

	var nextPlaceholderId = 1;

	function Placeholder(x, height, previous, row) {
		var self = this;
		this.id = nextPlaceholderId++;
		this.positionChangedListeners = [];
		this.row = row;

		// Draw the object
	   	this.g = document.createElementNS(svgNS, "g");
	   	this.g.setAttribute("id", "placeholder-" + this.id);
	   	this.border = document.createElementNS(svgNS, "rect");
		this.border.setAttribute("id", "placeholder-" + this.id + "-border");
		this.border.setAttribute("stroke", strokeColor);
		this.border.setAttribute("stroke-width", 4);
   		this.border.setAttribute("fill", "none");
		this.g.appendChild(this.border);

		this.setX(x);
		this.setWidth(placeholderWidth);
		this.setHeight(height);

		this.positionChangedListener = function (x) {
			self.setX(x);
		};

		this.heightChangedListener = function (height) {
			self.setHeight(height);
		};

		row.addHeightChangedListener(this.heightChangedListener);

		this.setPrevious(previous);
	}

	Placeholder.prototype.setUsed = function (used) {
		if (used) {
			this.border.setAttribute("fill", "#FF3300");

			if (!this.next) {
				this.row.addPlaceholder();
			}

			if (!this.row.nextRow) {
				addRow();
			}
		}
	};

	Placeholder.prototype.setHighlight = function (highlight) {
		var color = highlight ? highlightStrokeColor : strokeColor;
		this.border.setAttribute("stroke", color);
	};

	Placeholder.prototype.xCollide = function (x) {
		var lowerBound = this.x;
		var upperBound = this.x + this.width;

		if (x >= lowerBound && x <= upperBound) {
			// System.out.println("x: " + x + ", lowerBound: " + lowerBound + ", upperBound: " + upperBound);
			return true;
		}

		return false;
	};

	Placeholder.prototype.setPrevious = function (previous) {
		var newX;

		if (this.previous) {
			// We have an old previous placeholder. Remove listeners and set next, as our old next
			this.previous.removePositionChangedListener(this.positionChangedListener);
		}

		if (previous) {
			// We will be notified when the previous placeholder causes us to shuffle left or right
			previous.addPositionChangedListener(this.positionChangedListener);
			previous.setNext(this);

			// Because the previous placeholder has changed, our position may have changed
			newX = previous.x + previous.width + margin;
		} else {
			newX = 0;
		}

		// If our position has changed, set everything in motion
		if (newX !== this.x) {
			this.setX(newX);
		}

		this.previous = previous;
	};

	Placeholder.prototype.setNext = function (next) {
		this.next = next;
	};

	Placeholder.prototype.removeFromLinks = function () {
		if (this.previous) {
			// We have an old previous placeholder. Remove listeners and set next, as our old next
			this.previous.removePositionChangedListener(this.positionChangedListener);
		}

		if (this.next) {
			this.next.setPrevious(this.previous);
		}
	};

	Placeholder.prototype.remove = function () {
		// Remove element from DOM
		this.g.parentNode.removeChild(this.g);
		this.removeFromLinks();

		// Remove from the row
		this.row.removePlaceholder(this);
	};

	Placeholder.prototype.getElement = function () {
		return this.g;
	};

	Placeholder.prototype.setX = function (x) {
		this.x = x;
		this.g.setAttribute("transform", "translate(" + this.x + ",0)");
		this.notifyPositionChangedListeners();
	};

	Placeholder.prototype.setWidth = function (width) {
		this.width = width;
		this.border.setAttribute("width", this.width);
		this.notifyPositionChangedListeners();
	};

	Placeholder.prototype.setHeight = function (height) {
		this.height = height;
		this.border.setAttribute("height", this.height);

		// If this height is greater than the row height
		// then also set the row height.
		if (height > this.row.height) {
			this.row.setHeight(height);
		}
	};

	Placeholder.prototype.notifyPositionChangedListeners = function () {
		var self = this;
		this.positionChangedListeners.forEach(function (listener) {
			// Send the new x position for the next placeholder
			listener(self.x + self.width + margin);
		});
	};

	Placeholder.prototype.addPositionChangedListener = function (listener) {
		this.positionChangedListeners.push(listener);
	};

	Placeholder.prototype.removePositionChangedListener = function (listener) {
		this.positionChangedListeners = this.positionChangedListeners.filter(function (val) {
			val !== listener;
		});
	};


	function test() {
		testAddPlaceholder(placeholderRows[0], 6);
	}

	function testAddPlaceholder(row, count) {
		setTimeout(function () {
			System.out.println("Adding placeholder...");
			row.addPlaceholder();
			if (count > 0) {
				testAddPlaceholder(row, --count);
			} else {
				row.placeholders[3].setWidth(200);
				placeholdersGroup.setAttribute("width", 400);
				// testRemovePlaceholder(row, 5)
			}
		}, 1000);
	}


	function testRemovePlaceholder(row, count) {
		setTimeout(function () {
			System.out.println("Removing placeholder... (1st of " + row.placeholders.length + ")");
			row.placeholders[0].remove();
			if (count > 0) {
				testRemovePlaceholder(row, --count);
			}
		}, 1000);
	}

	function init() {
		document = window.document;
		svg = document.getDocumentElement();
		svgNS = window.svgNS;
		mimicFrame = window.mimicFrame;
		maxWidth = parseInt(svg.getAttribute("viewBox").split(" ")[2]);

		initPlaceholders();

		// Add initial row with placeholder
		var row = addRow();

		// test();
	}

	function initPlaceholders() {
		// Get the dash header height
		var dashHeader = document.getElementById("dash_header");
		var dashHeaderHeight = dashHeader.getBBox().height;
		dashHeaderHeight = isNaN(dashHeaderHeight) ? 0 : parseInt(dashHeaderHeight);
		placeholdersGroupX = dashHeaderHeight + (margin * 2);
		placeholdersGroup = document.createElementNS(svgNS, "g");
		placeholdersGroup.setAttribute("id", "placeholders");
		placeholdersGroup.setAttribute("transform", "translate(0," + placeholdersGroupX + ")");
		svg.appendChild(placeholdersGroup);
	}

	function addRow() {
		var y = 0;
		var previousRow;

		if (placeholderRows.length > 0) {
			previousRow = placeholderRows[placeholderRows.length - 1];
			y = previousRow.y + previousRow.height + margin;
		}

		var row = new PlaceholderRow(y, previousRow);
		// Add first placeholder on row
		row.addPlaceholder();
		placeholderRows.push(row);
		placeholdersGroup.appendChild(row.getElement());

		return row;
	}

	function dragEvent(e) {
		var placeholder = null;

		// Find the row
		var row = placeholderRows.find(function (val) {
			return val.yCollide(mimicDragY - placeholdersGroupX);
		});

		if (row) {
			placeholder = row.placeholders.find(function (val) {
				return val.xCollide(mimicDragX);
			});

			if (placeholder) {
				if (draggedOverPlaceholder && placeholder.id !== draggedOverPlaceholder) {
					draggedOverPlaceholder.setHighlight(false);
				}
			}
		}

		draggedOverPlaceholder = placeholder;

		if (draggedOverPlaceholder) {
			draggedOverPlaceholder.setHighlight(true);
		}
	}

	function dropEvent() {
		if (draggedOverPlaceholder) {
			draggedOverPlaceholder.setHighlight(false);
			draggedOverPlaceholder.setUsed(true);
			draggedOverPlaceholder = null;
		}
	}

	return {
		init: init,
		dragEvent: dragEvent,
		dropEvent: dropEvent
	};

}(window));

System.out.println("Loaded placeholders script");