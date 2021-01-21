
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    let gaid = 'UA-165865332-1'
    ga('create', gaid, {
        // 'cookieFlags': 'samesite=none;secure',
        'cookieName': '_ga_' + gaid.replaceAll('-', '_')
    });
    window.gah={setUser:function(v){ga("set","userId",v)},event:function(v,n,t,w)
    {ga("send","event",v,n,t,w)},wait:function(t,e,i){window.gah.vars=window.gah.vars||{},
    v=window.gah.vars,v.c=t,v.w=e,v.f=i,v.m=!0,v.pt=[]},pin:function()
    {v=window.gah.vars,v.m&&(v.pt.push(Date.now()),v.pt.length<v.c||
    ((v.pt[4]-v.pt[0])/1e3<=v.w?(v.f(),v.m=!1):v.pt=v.pt.slice(1)))}}