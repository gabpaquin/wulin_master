module WulinMaster
  class GridStatesManagesController < ::ActionController::Metal
    include ActionController::Rendering
    include ActionController::RequestForgeryProtection
    include WulinMasterGridHelper

    append_view_path "#{WulinMaster::Engine.root}/app/views"

    def save
      current_state = GridState.current(current_user.id, params[:grid_name])
      if current_state
        current_state.state_value = JSON(current_state.state_value.presence || "{}").merge(params[:state_type] => params[:state_value]).to_json
      else
        current_state = GridState.new(user_id: current_user.id, grid_name: params[:grid_name], 
          name: 'default', current: true, state_value: {params[:state_type] => params[:state_value]}.to_json)
      end
      if current_state.save
        self.response_body = {status: "success", data: {id: current_state.id, name: current_state.name}}.to_json
      else
        self.response_body = {status: "failed", data: current_state.errors.full_messages.join('\n')}.to_json
      end
    end
    
    def update
      new_state = GridState.find(params[:id])
      GridState.transaction do
        new_state.brother_states.update_all({:current => false})
        new_state.update_attributes!({:current => true})
      end
      self.response_body = "success"
    rescue
      self.response_body = $!.message
    end

    def manage
      @current_user = current_user
      @grid_name = params[:grid]
      @states_options = grid_states_options(@current_user.id, @grid_name)
      render '/manage_grid_states', layout: nil
    end

    def batch_update
      params[:grid_states] ||= {}
      all_states = GridState.for_user_and_grid(current_user.id, params[:grid_name])
      default_state = all_states.find_by_name('default')
      remaining_ids = params[:grid_states].map{|index, state| state["id"].presence}.compact.map(&:to_i)

      # delete some states
      GridState.delete(all_states.map(&:id) - remaining_ids - [default_state.id])
      # if only remaining default states, mark it as current
      default_state.update_attribute(:current, true)

      GridState.transaction do
        # update or create states
        params[:grid_states].each do |index, state|
          if state[:id].present?
            GridState.find(state[:id]).update_attributes!({:name => state[:name]})
          else
            GridState.create!(:name => state[:name], :user_id => current_user.id, :grid_name => params[:grid_name])
          end
        end
        self.response_body = "success"
      end
    rescue
      self.response_body = $!.message
    end
  end
end