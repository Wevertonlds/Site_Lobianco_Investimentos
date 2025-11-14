// script.js - VERSÃO CORRIGIDA - SEM ERRO DE MULTIPLAS LINHAS
const supabase = window.supabase.createClient(
  'https://zdwacbnbkzsqwrmvftyc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkd2FjYm5ia3pzcXdybXZmdHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTI5NDUsImV4cCI6MjA3ODU2ODk0NX0.JR-HYIT1eDkKdsb0UC7R2IBgV4pX1ON93TNEeGiB3jA'
);

const BANNER_PADRAO = "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=2070&q=80";

// UPLOAD DE FOTOS
async function uploadFotos(files, pasta) {
  const urls = [];
  
  for (let file of files) {
    try {
      const nome = Date.now() + "_" + Math.random().toString(36).substring(2) + "." + file.name.split('.').pop();
      const caminho = `${pasta}/${nome}`;
      
      const { data, error } = await supabase.storage
        .from('public_assets')
        .upload(caminho, file, { 
          upsert: true,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error("Erro no upload:", error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('public_assets')
        .getPublicUrl(caminho);
      
      urls.push(urlData.publicUrl);
      
    } catch (error) {
      console.error("Erro no processamento do arquivo:", error);
    }
  }
  
  return urls;
}

// EXCLUIR FOTOS DO STORAGE
async function excluirFotosStorage(urls) {
  if (!urls || urls.length === 0) return;
  
  try {
    const pathsToDelete = [];
    
    for (let url of urls) {
      const pathMatch = url.match(/public_assets\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        pathsToDelete.push(pathMatch[1]);
      }
    }
    
    if (pathsToDelete.length > 0) {
      const { error } = await supabase.storage
        .from('public_assets')
        .remove(pathsToDelete);
      
      if (error) {
        console.error("Erro ao excluir fotos:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao excluir fotos:", error);
  }
}

// CARREGAR CONFIGURAÇÃO - CORRIGIDO
async function carregarConfig() {
  try {
    // CORREÇÃO: Usar select().limit(1) em vez de maybeSingle()
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Erro ao carregar configuração:", error);
      aplicarConfigPadrao();
      return;
    }
    
    // Pega a primeira configuração (mais recente)
    const c = data && data.length > 0 ? data[0] : null;
    
    const config = c || { 
      site_name: "Lobianco Investimentos", 
      phone: "(34) 99970-4808",
      main_color: "#0066CC",
      secondary_color: "#003366",
      text_color: "#333333",
      logo_width: "60px",
      logo_height: "60px",
      company_address: "Uberlândia - MG",
      company_email: "contato@lobianco.com.br",
      whatsapp_link: "https://wa.me/5534999704808",
      instagram_link: "https://instagram.com/lobianco",
      facebook_link: "https://facebook.com/lobianco"
    };

    aplicarConfiguracoes(config);
    
  } catch (error) {
    console.error("Erro em carregarConfig:", error);
    aplicarConfigPadrao();
  }
}

// APLICAR CONFIGURAÇÕES NO SITE
function aplicarConfiguracoes(config) {
  // Nome do site
  if (document.getElementById('siteName')) {
    document.getElementById('siteName').textContent = config.site_name || "Lobianco";
  }
  
  // Logo
  const siteLogo = document.getElementById('siteLogo');
  if (siteLogo) {
    if (config.logo_url) {
      siteLogo.src = config.logo_url;
      siteLogo.style.display = 'block';
    }
    siteLogo.style.width = config.logo_width || '60px';
    siteLogo.style.height = config.logo_height || '60px';
  }
  
  // Telefone no footer
  if (document.getElementById('footerPhone')) {
    document.getElementById('footerPhone').textContent = 
      `${config.phone || "(34) 99970-4808"} | ${config.company_address || "Uberlândia - MG"}`;
  }
  
  // Cores
  document.documentElement.style.setProperty('--azul', config.main_color || '#0066CC');
  document.documentElement.style.setProperty('--azul-secundario', config.secondary_color || '#003366');
  document.documentElement.style.setProperty('--cor-texto', config.text_color || '#333333');
  
  // Redes sociais
  const whatsappLink = document.querySelector('.social-bar .whatsapp');
  const instagramLink = document.querySelector('.social-bar .instagram');
  const facebookLink = document.querySelector('.social-bar .facebook');
  
  if (whatsappLink && config.whatsapp_link) {
    whatsappLink.href = config.whatsapp_link;
  }
  if (instagramLink && config.instagram_link) {
    instagramLink.href = config.instagram_link;
  }
  if (facebookLink && config.facebook_link) {
    facebookLink.href = config.facebook_link;
  }
  
  // Carousel
  const carousel = document.getElementById('carouselImages');
  if (carousel) {
    carousel.innerHTML = '';
    const banners = config.banner_images?.length ? config.banner_images : [BANNER_PADRAO];
    banners.forEach((url, i) => {
      carousel.innerHTML += `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="${url}" class="d-block w-100" style="height:70vh;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'">
          <div class="carousel-caption text-end pe-5">
            <h1 class="display-3 fw-bold text-white">Viva o Alto Padrão</h1>
            <p class="fs-1 text-white">Lançamentos em Uberlândia</p>
            <span class="tag px-5 py-3 rounded-pill fw-bold fs-4">LANÇAMENTOS</span>
          </div>
        </div>`;
    });
  }
}

function aplicarConfigPadrao() {
  aplicarConfiguracoes({
    site_name: "Lobianco Investimentos",
    phone: "(34) 99970-4808",
    main_color: "#0066CC",
    secondary_color: "#003366",
    text_color: "#333333"
  });
}

// CARREGAR IMÓVEIS
async function carregarImoveis() {
  try {
    const { data, error } = await supabase.from('items').select('*');
    
    if (error) {
      console.error("Erro ao carregar imóveis:", error);
      return;
    }

    const secoes = [
      { id: 'lancamentos-cards', type: 'lancamento' },
      { id: 'planta-cards', type: 'na_planta' },
      { id: 'aluguel-cards', type: 'aluguel' }
    ];

    secoes.forEach(s => {
      const container = document.getElementById(s.id);
      if (!container) return;
      const lista = (data || []).filter(i => i.type === s.type);
      container.innerHTML = lista.length === 0 ? '<p class="text-center text-muted col-12">Em breve mais imóveis...</p>' : '';

      lista.forEach(imovel => {
        const img = imovel.image_urls?.[0] || BANNER_PADRAO;
        container.innerHTML += `
          <div class="col mb-4">
            <div class="card h-100 shadow border-0 property-card">
              <img src="${img}" class="card-img-top" style="height:250px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">${imovel.title}</h5>
                <p class="text-muted small">${imovel.location || 'Uberlândia'}</p>
                <p class="card-text flex-grow-1">${(imovel.description || '').substring(0,100)}...</p>
                <p class="text-primary fw-bold fs-3 mt-auto">${imovel.price || 'Consulte'}</p>
              </div>
            </div>
          </div>`;
      });
    });
  } catch (error) {
    console.error("Erro em carregarImoveis:", error);
  }
}

// SALVAR IMÓVEL
window.salvarImovel = async function(tipo) {
  try {
    const titulo = document.getElementById(`tit_${tipo}`)?.value.trim();
    if (!titulo) {
      alert("Preencha o título do imóvel!");
      return;
    }

    const fileInput = document.getElementById(`fotos_${tipo}`);
    let fotosUrls = [];
    
    if (fileInput?.files.length > 0) {
      fotosUrls = await uploadFotos(fileInput.files, tipo);
    }

    const dados = {
      type: tipo,
      title: titulo,
      description: document.getElementById(`desc_${tipo}`)?.value || '',
      price: document.getElementById(`preco_${tipo}`)?.value || '',
      location: document.getElementById(`loc_${tipo}`)?.value || '',
      bedrooms: parseInt(document.getElementById(`quartos_${tipo}`)?.value) || 0,
      bathrooms: parseInt(document.getElementById(`banheiros_${tipo}`)?.value) || 0,
      area: document.getElementById(`area_${tipo}`)?.value || null,
      garage: parseInt(document.getElementById(`garagem_${tipo}`)?.value) || 0,
      pool: document.getElementById(`piscina_${tipo}`)?.checked || false,
      image_urls: fotosUrls
    };

    const { error } = await supabase.from('items').insert(dados);

    if (error) {
      alert("Erro ao salvar imóvel: " + error.message);
    } else {
      alert("Imóvel salvo com sucesso!");
      // LIMPA TODOS OS CAMPOS
      document.querySelectorAll(`#tit_${tipo}, #desc_${tipo}, #preco_${tipo}, #loc_${tipo}, #quartos_${tipo}, #banheiros_${tipo}, #area_${tipo}, #garagem_${tipo}`).forEach(el => {
        el.value = '';
      });
      const piscinaCheckbox = document.getElementById(`piscina_${tipo}`);
      if (piscinaCheckbox) piscinaCheckbox.checked = false;
      
      if (fileInput) fileInput.value = '';
      carregarImoveis();
    }
  } catch (error) {
    console.error("Erro em salvarImovel:", error);
    alert("Erro ao salvar imóvel. Verifique o console.");
  }
};

// EXCLUIR IMÓVEL
window.excluirImovel = async function(id) {
  try {
    if (!confirm("Tem certeza que quer excluir este imóvel? Esta ação não pode ser desfeita.")) return;

    const { data: imovel, error: fetchError } = await supabase
      .from('items')
      .select('image_urls')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar imóvel:", fetchError);
      alert("Erro ao buscar imóvel: " + fetchError.message);
      return;
    }

    if (imovel?.image_urls?.length > 0) {
      await excluirFotosStorage(imovel.image_urls);
    }

    const { error } = await supabase.from('items').delete().eq('id', id);
    
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      alert("Imóvel excluído com sucesso!");
      carregarImoveis();
    }
  } catch (error) {
    console.error("Erro em excluirImovel:", error);
    alert("Erro ao excluir imóvel. Verifique o console.");
  }
};

// SALVAR CONFIGURAÇÃO - CORRIGIDO
window.salvarConfiguracao = async function() {
  try {
    const siteName = document.getElementById('cfg_siteName')?.value.trim() || "Lobianco Investimentos";
    const phone = document.getElementById('cfg_phone')?.value.trim() || "(34) 99970-4808";
    const email = document.getElementById('cfg_email')?.value.trim() || "contato@lobianco.com.br";
    const address = document.getElementById('cfg_address')?.value.trim() || "Uberlândia - MG";
    const whatsapp = document.getElementById('cfg_whatsapp')?.value.trim() || "https://wa.me/5534999704808";
    const instagram = document.getElementById('cfg_instagram')?.value.trim() || "https://instagram.com/lobianco";
    const facebook = document.getElementById('cfg_facebook')?.value.trim() || "https://facebook.com/lobianco";
    const mainColor = document.getElementById('cfg_mainColor')?.value || "#0066CC";
    const secondaryColor = document.getElementById('cfg_secondaryColor')?.value || "#003366";
    const textColor = document.getElementById('cfg_textColor')?.value || "#333333";
    const logoWidth = document.getElementById('cfg_logoWidth')?.value || "60px";
    const logoHeight = document.getElementById('cfg_logoHeight')?.value || "60px";
    
    const logoFile = document.getElementById('cfg_logo')?.files[0];
    const bannerFiles = document.getElementById('cfg_banners')?.files;

    // CORREÇÃO: Buscar a configuração mais recente
    const { data: configs } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    const configAtual = configs && configs.length > 0 ? configs[0] : null;

    let logoUrl = configAtual?.logo_url || '';
    let bannerUrls = configAtual?.banner_images || [];

    // Upload do logo se fornecido
    if (logoFile) {
      const nomeLogo = "logo_" + Date.now() + ".png";
      const { error } = await supabase.storage.from('public_assets').upload(`config/${nomeLogo}`, logoFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('public_assets').getPublicUrl(`config/${nomeLogo}`);
        logoUrl = data.publicUrl;
      }
    }

    // Upload dos banners se fornecidos
    if (bannerFiles && bannerFiles.length > 0) {
      bannerUrls = [];
      for (let file of bannerFiles) {
        const ext = file.name.split('.').pop();
        const nome = "banner_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8) + "." + ext;
        const { error } = await supabase.storage.from('public_assets').upload(`banners/${nome}`, file, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from('public_assets').getPublicUrl(`banners/${nome}`);
          bannerUrls.push(data.publicUrl);
        }
      }
    }

    const configData = {
      site_name: siteName,
      phone: phone,
      company_email: email,
      company_address: address,
      whatsapp_link: whatsapp,
      instagram_link: instagram,
      facebook_link: facebook,
      main_color: mainColor,
      secondary_color: secondaryColor,
      text_color: textColor,
      logo_url: logoUrl,
      logo_width: logoWidth,
      logo_height: logoHeight,
      banner_images: bannerUrls.length > 0 ? bannerUrls : [],
      updated_at: new Date().toISOString()
    };

    let error;
    
    // CORREÇÃO: Se já existe configuração, faz update, senão insert
    if (configAtual && configAtual.id) {
      ({ error } = await supabase.from('site_config').update(configData).eq('id', configAtual.id));
    } else {
      ({ error } = await supabase.from('site_config').insert(configData));
    }

    if (error) {
      alert("Erro ao salvar configuração: " + error.message);
    } else {
      alert("Configurações salvas com sucesso! A página será recarregada.");
      location.reload();
    }
  } catch (error) {
    console.error("Erro em salvarConfiguracao:", error);
    alert("Erro ao salvar configuração. Verifique o console.");
  }
};

// ABRIR GESTÃO - CORRIGIDO
async function abrirGestao() {
  try {
    const { data: imoveis, error } = await supabase.from('items').select('*');
    
    if (error) {
      alert("Erro ao carregar imóveis: " + error.message);
      return;
    }

    await preencherCamposConfiguracao();

    const tipos = [
      { tipo: 'lancamento', nome: 'Lançamentos', tabId: 'tabLancamentos' },
      { tipo: 'na_planta', nome: 'Na Planta', tabId: 'tabPlanta' },
      { tipo: 'aluguel', nome: 'Aluguel', tabId: 'tabAluguel' }
    ];

    tipos.forEach(t => {
      const el = document.getElementById(t.tabId);
      if (!el) return;
      const lista = (imoveis || []).filter(i => i.type === t.tipo);

      el.innerHTML = `
        <h5 class="text-primary fw-bold mb-4">Cadastrar ${t.nome}</h5>
        <div class="border rounded p-4 bg-light mb-5">
          <div class="row g-3">
            <div class="col-12"><input class="form-control form-control-lg" id="tit_${t.tipo}" placeholder="Título do imóvel *"></div>
            <div class="col-12"><textarea class="form-control" rows="4" id="desc_${t.tipo}" placeholder="Descrição completa"></textarea></div>
            <div class="col-md-4"><input class="form-control" id="preco_${t.tipo}" placeholder="Preço"></div>
            <div class="col-md-4"><input class="form-control" id="loc_${t.tipo}" placeholder="Localização"></div>
            <div class="col-md-2"><input type="number" class="form-control" id="quartos_${t.tipo}" placeholder="Quartos"></div>
            <div class="col-md-2"><input type="number" class="form-control" id="banheiros_${t.tipo}" placeholder="Banheiros"></div>
            <div class="col-md-3"><input class="form-control" id="area_${t.tipo}" placeholder="Área m²"></div>
            <div class="col-md-3"><input type="number" class="form-control" id="garagem_${t.tipo}" placeholder="Vagas"></div>
            <div class="col-md-3"><div class="form-check mt-2"><input type="checkbox" class="form-check-input" id="piscina_${t.tipo}"><label class="form-check-label">Piscina</label></div></div>
            <div class="col-12"><input type="file" multiple class="form-control" id="fotos_${t.tipo}" accept="image/*"></div>
            <div class="col-12 text-end mt-3">
              <button class="btn btn-success btn-lg px-5" onclick="salvarImovel('${t.tipo}')">SALVAR IMÓVEL</button>
            </div>
          </div>
        </div>

        <h5 class="mt-5 mb-3">Imóveis Cadastrados (${lista.length})</h5>
        <div class="row row-cols-1 row-cols-md-3 g-4" id="lista-${t.tipo}">
          ${lista.map(i => `
            <div class="col">
              <div class="card h-100 shadow">
                <img src="${i.image_urls?.[0] || BANNER_PADRAO}" class="card-img-top" style="height:200px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'">
                <div class="card-body d-flex flex-column">
                  <h6 class="fw-bold">${i.title}</h6>
                  <p class="text-muted small">${i.location || ''}</p>
                  <p class="text-primary fw-bold">${i.price || ''}</p>
                  <button class="btn btn-danger btn-sm mt-auto" onclick="excluirImovel('${i.id}')">Excluir</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>`;
    });

    // Adiciona evento para preencher configurações quando clicar na aba
    document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
      tab.addEventListener('shown.bs.tab', function (e) {
        if (e.target.getAttribute('href') === '#tabConfig') {
          preencherCamposConfiguracao();
        }
      });
    });

    new bootstrap.Modal(document.getElementById('gestaoModal')).show();
  } catch (error) {
    console.error("Erro em abrirGestao:", error);
    alert("Erro ao abrir gestão. Verifique o console.");
  }
}

// FUNÇÃO SEPARADA PARA PREENCHER CONFIGURAÇÕES - CORRIGIDA
async function preencherCamposConfiguracao() {
  try {
    // CORREÇÃO: Usar select().limit(1) em vez de maybeSingle()
    const { data: configs } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    const config = configs && configs.length > 0 ? configs[0] : null;
    
    if (config) {
      const setValueIfExists = (id, value) => {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null) {
          element.value = value;
        }
      };

      setValueIfExists('cfg_siteName', config.site_name);
      setValueIfExists('cfg_phone', config.phone);
      setValueIfExists('cfg_email', config.company_email);
      setValueIfExists('cfg_address', config.company_address);
      setValueIfExists('cfg_whatsapp', config.whatsapp_link);
      setValueIfExists('cfg_instagram', config.instagram_link);
      setValueIfExists('cfg_facebook', config.facebook_link);
      setValueIfExists('cfg_mainColor', config.main_color);
      setValueIfExists('cfg_secondaryColor', config.secondary_color);
      setValueIfExists('cfg_textColor', config.text_color);
      setValueIfExists('cfg_logoWidth', config.logo_width);
      setValueIfExists('cfg_logoHeight', config.logo_height);
    }
  } catch (error) {
    console.error("Erro ao preencher campos de configuração:", error);
  }
}

// INÍCIO
document.addEventListener('DOMContentLoaded', () => {
  carregarConfig();
  carregarImoveis();

  document.addEventListener('click', (e) => {
    if (e.target.closest('#openGestao')) {
      new bootstrap.Modal(document.getElementById('loginModal')).show();
    }
    if (e.target.id === 'btnLogin' || e.target.closest('#btnLogin')) {
      const email = document.getElementById('loginEmail')?.value.trim();
      const senha = document.getElementById('loginPassword')?.value;
      if (email && senha) {
        bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
        abrirGestao();
      } else {
        document.getElementById('loginError').textContent = "Preencha os campos!";
      }
    }
  });
});