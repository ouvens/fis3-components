
<% for(var i = 0, len = data.list.length; i < len; i++ ){ %>
    <li class="ui-border-t" data-href="data.list[i].url">
        <div class="ui-list-img">
            <img src="<%= data.list[i].image %>" alt="data[i].title" width="90" height="70">
        </div>
        <div class="ui-list-info">
            <h4><%= data.list[i].title %></h4>
        </div>
    </li>
<% } %>