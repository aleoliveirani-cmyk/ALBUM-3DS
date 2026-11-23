(function(){
  const KEY = "meu_album_v1";
  const padrao = {
    textos:{},
    songs:["Música 1 — Artista","Música 2 — Artista","Música 3 — Artista"],
    hobbies:["Ouvir música","Fotografar","Desenhar"],
    cor:"#7a1426",
    qr:"https://exemplo.com",
    polas:[
      {img:"",leg:"legenda 1"},{img:"",leg:"legenda 2"},
      {img:"",leg:"legenda 3"},{img:"",leg:"legenda 4"}
    ]
  };
  let S;
  try{ S = JSON.parse(localStorage.getItem(KEY)) || structuredClone(padrao); }
  catch(e){ S = structuredClone(padrao); }

  function salvar(){
    try{ localStorage.setItem(KEY, JSON.stringify(S)); }
    catch(e){ alert("Sem espaço para salvar. Use fotos menores ou remova alguma."); }
  }
  const $ = id => document.getElementById(id);

  /* ---------- textos simples ---------- */
  document.querySelectorAll(".ed").forEach(el=>{
    const k = el.dataset.key;
    if(S.textos[k] !== undefined) el.innerHTML = S.textos[k];
    el.addEventListener("input",()=>{ S.textos[k] = el.innerHTML; salvar(); });
  });

  /* ---------- músicas ---------- */
  function renderSongs(){
    const ol = $("songs"); ol.innerHTML="";
    S.songs.forEach((t,i)=>{
      const li = document.createElement("li");
      const sp = document.createElement("span"); sp.className="t"; sp.textContent=t;
      sp.contentEditable = editando;
      sp.addEventListener("input",()=>{ S.songs[i]=sp.textContent; salvar(); });
      const x = document.createElement("button"); x.className="x"; x.textContent="✕";
      x.onclick=()=>{ S.songs.splice(i,1); salvar(); renderSongs(); };
      li.append(sp,x); ol.appendChild(li);
    });
  }
  $("addSong").onclick=()=>{ S.songs.push("Nova música — Artista"); salvar(); renderSongs(); };

  /* ---------- hobbies ---------- */
  function renderHobbies(){
    const box=$("hobbies"); box.innerHTML="";
    S.hobbies.forEach((t,i)=>{
      const c=document.createElement("div"); c.className="chip";
      const sp=document.createElement("span"); sp.textContent=t; sp.contentEditable=editando;
      sp.addEventListener("input",()=>{ S.hobbies[i]=sp.textContent; salvar(); });
      const x=document.createElement("button"); x.className="x"; x.textContent="✕";
      x.onclick=()=>{ S.hobbies.splice(i,1); salvar(); renderHobbies(); };
      c.append(sp,x); box.appendChild(c);
    });
  }
  $("addHobby").onclick=()=>{ S.hobbies.push("novo hobby"); salvar(); renderHobbies(); };

  /* ---------- cor ---------- */
  function aplicarCor(){
    document.documentElement.style.setProperty("--cor-fav",S.cor);
    $("corPicker").value=S.cor;
  }
  $("corPicker").addEventListener("input",e=>{ S.cor=e.target.value; aplicarCor(); salvar(); });

  /* ---------- polaroids ---------- */
  function reduzir(file,cb){
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=700, s=Math.min(1,max/Math.max(img.width,img.height));
        const c=document.createElement("canvas");
        c.width=img.width*s; c.height=img.height*s;
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        cb(c.toDataURL("image/jpeg",.82));
      };
      img.src=r.result;
    };
    r.readAsDataURL(file);
  }
  function renderPolas(){
    const box=$("polas"); box.innerHTML="";
    S.polas.forEach((p,i)=>{
      const d=document.createElement("div"); d.className="pola";
      const f=document.createElement("div"); f.className="foto";
      if(p.img){ const im=document.createElement("img"); im.src=p.img; f.appendChild(im); }
      else f.textContent="clique para adicionar foto";
      f.onclick=()=>{
        const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
        inp.onchange=()=>{ if(inp.files[0]) reduzir(inp.files[0],url=>{ p.img=url; salvar(); renderPolas(); }); };
        inp.click();
      };
      const l=document.createElement("div"); l.className="legenda"; l.textContent=p.leg; l.contentEditable=editando;
      l.addEventListener("input",()=>{ p.leg=l.textContent; salvar(); });
      const rm=document.createElement("button"); rm.className="rm"; rm.textContent="remover polaroid";
      rm.onclick=()=>{ S.polas.splice(i,1); salvar(); renderPolas(); };
      d.append(f,l,rm); box.appendChild(d);
    });
  }
  $("addPola").onclick=()=>{ S.polas.push({img:"",leg:"nova legenda"}); salvar(); renderPolas(); };

  /* ---------- QR ---------- */
  let qr;
  function renderQR(){
    const box=$("qrcode"); box.innerHTML="";
    if(typeof QRCode==="undefined"){ box.textContent="Conecte à internet para gerar o QR."; return; }
    qr=new QRCode(box,{text:S.qr||" ",width:170,height:170,colorDark:"#0c0c0e",colorLight:"#f7f3f2",correctLevel:QRCode.CorrectLevel.M});
  }
  $("qrInput").value=S.qr;
  $("qrInput").addEventListener("input",e=>{ S.qr=e.target.value; salvar(); renderQR(); });

  /* ---------- modo edição ---------- */
  let editando=false;
  $("btnEdit").onclick=()=>{
    editando=!editando;
    document.body.classList.toggle("edit-on",editando);
    $("btnEdit").textContent = editando ? "✓ Concluir" : "✎ Editar";
    document.querySelectorAll(".ed").forEach(el=>el.contentEditable=editando);
    renderSongs(); renderHobbies(); renderPolas();
  };
  $("btnReset").onclick=()=>{
    if(confirm("Apagar tudo e voltar ao padrão?")){ localStorage.removeItem(KEY); location.reload(); }
  };

  aplicarCor(); renderSongs(); renderHobbies(); renderPolas(); renderQR();
})();
