// Toolbar Item 'Add Detail' for detail grid

WulinMaster.actions.AddDetail = $.extend({}, WulinMaster.actions.BaseAction, {
  name: 'add_detail',

  handler: function(e) {
    var self = this;
    var masterId = this.target.master.filter_value;
    
    var $modelDialog = $("<div/>").attr({id: this.model + '_dialog', title: "Available " + this.model}).css('display', 'none').appendTo($('body'));
    $modelDialog.dialog({
      autoOpen: true,
      width: 750,
      height: 600,
      buttons: {
        Attach: function() {
          self.appendNewRecordToMiddleTable(masterId, $modelDialog);
        },
        Cancel: function() {
          $(this).dialog( "destroy" );
          $modelDialog.remove();
        }
      },
      close: function() { 
        $(this).dialog("destroy");
        $modelDialog.remove();
      },
      open: function(event, ui) {
        self.getModelGrid(masterId, $modelDialog);
      }
    });
  },
  
  getModelGrid: function(masterId, dialogDom) {
    var master = this.target.master;
    //var filters = [];
    //filters.push({column: master.filter_column, value: masterId, operator: 'exclude'});
    var url = "/" + this.model + "s?screen=" + this.screen + "&filters[][column]=" + master.filter_column + "&filters[][value]=" + masterId + "&filters[][operator]=exclude";
    $.ajax({
      type: 'GET',
      url: url
    })
    .success(function(response){
      dialogDom.html(response);
    });
  },
  
  appendNewRecordToMiddleTable: function(masterId, dialogDom) {
    var self = this;
    var middleModel = this.target.model;
    var detailGridName = dialogDom.find(".grid_container").attr("id").replace("grid_", "")
    var detailGrid = gridManager.getGrid(detailGridName);
    var detailIds = detailGrid.getSelectedIds();
    
    if(detailIds.length == 0) {
      displayErrorMessage("Please select at least one " + this.model);
    } else {
      var data = {master_column: this.target.master.filter_column, master_id: masterId, detail_model: this.model, detail_ids: detailIds, model: middleModel}
      $.post('/wulin_master/attach_details', data, function(response){
        displayNewNotification(response.message);
        dialogDom.dialog( "destroy" );
        dialogDom.remove();
        self.target.loader.reloadData();
      });
    }
  }
});

WulinMaster.ActionManager.register(WulinMaster.actions.AddDetail);