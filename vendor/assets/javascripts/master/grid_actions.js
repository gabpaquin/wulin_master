// ------------------------------------ UI tools -----------------------------------------
var Ui = {	
	// Select record id attribute form grid
	selectIds: function(grid){
	  if(grid == null) return false;
		var selectedIndexs = grid.getSelectedRows();
		if (selectedIndexs.length > 0) {
			var ids = selectedIndexs.map(function(n, i) { 
				var item = grid.store.loader.data[n];
				return item['id']; 
				}).join();
			return ids;
		} else {
			return false;
		}
	},
	
	// return true if the dialog of grid with "name" is open, unless return false 
	isOpen: function() {
 		return ($(".ui-dialog:visible").size() > 0);
	},
	
	// check if the grid is being edited
	isEditing: function() {
	  var editing = false;
	  $.each(gridManager.grids, function(){
	    if(this.isEditing()) editing = true;
	  });
	  return editing;
	},
	
	// Select grid names
	selectGridNames: function() {
		var gridContainers = $(".grid_container");
		return $.map( gridContainers, function(container){
			var gridName = $(container).attr("id").split("grid_")[1].trim();
			if (gridName != '' && gridName != null && gridName != undefined)
		  	return gridName;
		});
	},
	
	// Reset form
	resetForm: function(name) {
		$(':input','#new_' + name).not(':button, :submit, :reset, :hidden').val('').removeAttr('checked').removeAttr('selected');
	},
	
	// Create and open dialog
	openDialog: function(name) {
		$( '#' + name + '-form' ).dialog({
			height: 300,
			width: 500,
			show: "blind",
			modal: true,
			open: function(event, ui) { $( '#' + name + '-form input:text' ).first().focus(); },
			close: function(event, ui) { 
			  $(this).find("input:text").val("");
			  $(this).find(".field_error").text(""); 
			}
		});
	},
	
	// Close dialog
	closeDialog: function(name) {
		$( '#' + name + '-form' ).dialog( "close" );
	},
	
	// find the selected grid
	findCurrentGrid: function() {
	  var currentGrid = null;
	  $.each(gridManager.grids, function(){
	    if(this.getSelectedRows().length > 0) {
	      currentGrid = this;
      }
	  });
	  return currentGrid;
	}
	
};



// ------------------------- keypress action --------------------------------------
(function($) {
  $(document).keypress(function(e){
    var isEditing = Ui.isEditing();
  	var isOpen = Ui.isOpen();
  	var grid = Ui.findCurrentGrid();
  	if (isOpen || isEditing) {
  		return true;
  	} else {
  		if (e.which == 100) {  // keypress 'D' for delete
  			var ids = Ui.selectIds(grid);
  			if (ids) {
  			  if(confirm("Are you sure to do this?")) {
  				  Requests.deleteByAjax(grid, ids);
  				  return false;
  			  }
  		  }
  			return false;
      } else if (e.which == 99) {  // keypress 'C' for show dialog
  			var	gridSize = gridManager.grids.length;
  			if (gridSize > 0) {
  				if (gridSize == 1) {
  					var gridName = gridManager.grids[0].name;
  					Ui.openDialog(gridName);
  				} else if (Ui.selectIds(grid)) {
  					Ui.openDialog(grid.name);
  				}
  				return false;
  			}
  			return false;
  		} else {
  			return true;
  		}
  	}	
  });
})(jQuery);
