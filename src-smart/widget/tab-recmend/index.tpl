
<% for(var i = 0, len = data.list.length; i < len; i++ ){ %>
    <li class="ui-border-t" data-href="<%= data.list[i].url %>">
        <div class="ui-list-img">
            <a href="<%= data.list[i].url %>">
                <img src="<%= data.list[i].image %>" alt="<%= data.list[i].title %>" width="90" height="70">
            </a>
        </div>
        <div class="ui-list-info">
            <h4 class="ui-nowrap"><%= data.list[i].title %></h4>
            <p class="ui-nowrap"><%= data.list[i].desc %></p>
        </div>
    </li>
<% } %>