
<% for(var i = 0, len = data.length; i < len; i++ ){ %>
    <li class="ui-border-t">
        <div class="ui-list-img">
            <img src="<%= data[i].image %>" alt="data[i].title" width="60" height="60">
        </div>
        <div class="ui-list-info">
            <p class="ui-nowrap"><%= data[i].title %></p>
            <p class="ui-nowrap"><%= data[i].desc %></p>
        </div>
    </li>
<% } %>