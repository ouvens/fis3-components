
<ul class="ui-grid-trisect">
    <% for(var i = 0, len = data.list.length; i < len; i++ ){ %>
    <li>
        <div class="ui-border">
            <div class="ui-grid-trisect-img">
                <a href="<%= data.list[i].url %>">
                    <img src="<%= data.list[i].image %>" alt="">
                </a>
            </div>
            <div>
                <h4 class="ui-nowrap-multi"><%= data.list[i].title %></h4>
            </div>
        </div>
    </li>
    <% } %>
</ul>