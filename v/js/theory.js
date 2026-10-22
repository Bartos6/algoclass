const a=[...document.querySelectorAll(".theory-sidebar a")],s=a.map(x=>document.querySelector(x.hash));function u(){let c=s[0];s.forEach(x=>{if(x.getBoundingClientRect().top<155)c=x});a.forEach(x=>x.classList.toggle("active",x.hash==="#"+c.id))}addEventListener("scroll",u,{passive:true});u();
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click",event=>{
    const target=document.querySelector(link.getAttribute("href"));
    if(!target)return;
    event.preventDefault();
    history.pushState(null,"",link.getAttribute("href"));
    target.scrollIntoView({behavior:"smooth",block:"start"});
  });
});
window.addEventListener("load",()=>{
  if(location.hash){
    const target=document.querySelector(location.hash);
    if(target)setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }
});
