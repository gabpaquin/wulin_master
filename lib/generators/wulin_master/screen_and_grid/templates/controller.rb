class <%= class_name.pluralize %>Controller < WulinMaster::ScreenController
  controller_for_screen <%= class_name %>Screen
  controller_for_grid :<%= underscored_name %>
end