<% for(var i = 0, len = data.length; i < len; i++ ){ %>
    <li>
        <a href="<%= data[i].url %>">
            <img src="<%= data[i].image %>" alt="data[i].title">
        </a>
    </li>
<% } %>