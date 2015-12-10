<li>
    <ul class="page">
    <% for(var i = 0, len = data.length; i < len; i++ ){ %>

        <% if( i>0 && i%8 === 0) {%>
            </ul>
        </li>
        <li>
            <ul class="page">
        <% } %>

        <li class="page-item" data-href="<%= data[i].url %>">
            <span class="page-item-bd <%= data[i].icon %>" style="background-image:url(http://placeholder.qiniudn.com/100x100)"></span>
            <span class="page-item-ft"><%= data[i].title %></span>
        </li>
    
    <% } %>
    </ul>
</li>