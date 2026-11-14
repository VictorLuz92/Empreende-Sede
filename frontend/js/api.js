const API_ORIGIN = window.API_ORIGIN || "http://localhost:8080";
const API_BASE_URL = `${API_ORIGIN}/api/companies`;
const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;
const ADMIN_BASE_URL = `${API_ORIGIN}/api/admin`;

const USER_TOKEN_KEY = "empreende_sede_user_token";
const USER_INFO_KEY = "empreende_sede_user_info";
const STORAGE_KEY = "empreende_sede_demo_companies_v6";

const OFFICIAL_SERVICE_CATEGORIES = [
    "Mão de Obra",
    "Comércio",
    "Gastronomia",
    "Beleza (Masculina/Feminina)",
    "Vestuário"
];

const OFFICIAL_SERVICE_SUBSEGMENTS = {
    "Mão de Obra": [
        "Reparos & Hidráulica",
        "Elétrica & Instalações",
        "Marcenaria & Móveis",
        "Pintura & Reformas"
    ],
    "Comércio": [
        "Hortifrúti & Orgânicos",
        "Informática & Celulares",
        "Mercearia & Empório",
        "Papelaria & Utilidades"
    ],
    "Gastronomia": [
        "Cafeteria & Padaria",
        "Pizzaria & Massas",
        "Doceria & Confeitaria",
        "Marmitas & Caseiros"
    ],
    "Beleza (Masculina/Feminina)": [
        "Salão Unissex",
        "Barbearia",
        "Unhas & Sobrancelhas",
        "Estética & Cuidados"
    ],
    "Vestuário": [
        "Moda Local & Ajustes",
        "Fitness & Esportes",
        "Jeans & Casual",
        "Infantil & Acessórios"
    ]
};

const SERVICE_PHOTOS = {
    mao1: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    mao2: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    mao3: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    com1: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    com2: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    com3: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
    gas1: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    gas2: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    gas3: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    bel1: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
    bel2: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
    bel3: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    ves1: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    ves2: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80",
    ves3: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
};

const RAW_SEED_COMPANIES = [
    // Mão de Obra — Reparos & Hidráulica (15 exemplos)
    ["Sede Manutenção & Reparos", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao1, "Serviços elétricos, hidráulicos, montagem de móveis e pequenos reparos residenciais e comerciais com garantia.", "(11) 91234-5678", "5511912345678", "sedemanutencao.oficial"],
    ["HidroFix Caça-Vazamentos", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao2, "Desentupimento, troca de registros, caixas d'água, torneiras e reparos hidráulicos emergenciais na comunidade.", "(11) 91234-5601", "5511912345601", "hidrofix.sede"],
    ["Marido de Aluguel Express", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao3, "Fixação de prateleiras, suporte de TV, troca de fechaduras, chuveiros e manutenção geral do lar.", "(11) 91234-5602", "5511912345602", "maridoexpress.local"],
    ["Água Clara Desentupidora", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao1, "Desentupimento de pias, ralos, vasos sanitários e limpeza de caixas de gordura sem quebra-quebra.", "(11) 91234-5603", "5511912345603", "aguaclara.sede"],
    ["Chave & Fechadura 24h", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao2, "Troca de miolo, instalação de fechaduras digitais, cópias de chaves e reparo em portões.", "(11) 91234-5604", "5511912345604", "chavefechadura24h"],
    ["Conexão Hidráulica Bairro", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao3, "Instalação de misturadores, válvulas Hydra, aquecedores e tubulações de água fria e quente.", "(11) 91234-5605", "5511912345605", "conexaohidraulica.sede"],
    ["SOS Torneiras & Registros", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao1, "Reparo rápido de vazamentos em pias, descargas acopladas, sifões e registros de gaveta.", "(11) 91234-5606", "5511912345606", "sostorneiras.local"],
    ["VedaTudo Impermeabilização", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao2, "Vedação de box de banheiro, rejunte impermeável, calhas e reparo de infiltrações leves.", "(11) 91234-5607", "5511912345607", "vedatudo.reparos"],
    ["MontaFácil Móveis & Suportes", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao3, "Montagem e desmontagem de guarda-roupas, painéis, cortinas, varões e móveis recém-comprados.", "(11) 91234-5608", "5511912345608", "montafacil.sede"],
    ["Caixa Limpa Higienização", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao1, "Limpeza e vedação de caixas d'água residenciais, troca de boias e filtros de entrada.", "(11) 91234-5609", "5511912345609", "caixalimpa.sede"],
    ["Serralheria & Reparos Souza", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao2, "Soldas rápidas, ajuste de portões basculantes, troca de dobradiças e grades de proteção.", "(11) 91234-5610", "5511912345610", "serralheriasouza"],
    ["ProntoLar Reparos Rápidos", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao3, "Pequenos consertos domésticos, instalação de tanquinhos, lava-louças e troca de chuveiros.", "(11) 91234-5611", "5511912345611", "prontolar.sede"],
    ["Tubo & Pressão Hidráulica", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao1, "Instalação de bombas pressurizadoras, tubulações de piscina e detecção acústica de vazamentos.", "(11) 91234-5612", "5511912345612", "tuboepressao.sede"],
    ["Casa em Ordem Manutenção", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao2, "Manutenção preventiva mensal para residências e comércios: hidráulica, ferragens e ajustes gerais.", "(11) 91234-5613", "5511912345613", "casaemordem.sede"],
    ["Ralo Livre & Encanamentos", "Mão de Obra", "Reparos & Hidráulica", SERVICE_PHOTOS.mao3, "Troca de colunas de PVC, reparo em encanamentos antigos e instalação de ralos lineares.", "(11) 91234-5614", "5511912345614", "ralolivre.sede"],
    // Mão de Obra — Elétrica & Instalações
    ["EletroForte Instalações", "Mão de Obra", "Elétrica & Instalações", SERVICE_PHOTOS.mao2, "Instalação de ar-condicionado, quadros elétricos, tomadas e iluminação LED com atendimento rápido em toda a cidade.", "(11) 93456-7810", "5511934567810", "eletroforte.sede"],
    ["Luz & Ponto Elétrica", "Mão de Obra", "Elétrica & Instalações", SERVICE_PHOTOS.mao1, "Projetos de iluminação residencial, ventiladores de teto, automação simples e revisão segura de fiação.", "(11) 93456-7811", "5511934567811", "luzeponto.eletrica"],
    ["ClimaCerto Refrigeração", "Mão de Obra", "Elétrica & Instalações", SERVICE_PHOTOS.mao3, "Instalação, higienização e recarga de gás para ar-condicionado split e balcões refrigerados.", "(11) 93456-7812", "5511934567812", "climacerto.sede"],
    // Mão de Obra — Marcenaria & Móveis
    ["Marcenaria Tradição & Sob Medida", "Mão de Obra", "Marcenaria & Móveis", SERVICE_PHOTOS.mao3, "Móveis planejados, restauração em madeira maciça, portas e painéis ripados feitos sob medida para sua casa ou loja.", "(11) 94567-8912", "5511945678912", "marcenariatradicao"],
    ["Arte em Madeira Planejados", "Mão de Obra", "Marcenaria & Móveis", SERVICE_PHOTOS.mao1, "Cozinhas planejadas, guarda-roupas, nichos e balcões comerciais com acabamento em MDF.", "(11) 94567-8913", "5511945678913", "arteemmadeira.sede"],
    ["Oficina do Marceneiro", "Mão de Obra", "Marcenaria & Móveis", SERVICE_PHOTOS.mao2, "Conserto de cadeiras, troca de dobradiças, ajuste de gavetas e fabricação de mesas artesanais.", "(11) 94567-8914", "5511945678914", "oficinadomarceneiro"],
    // Mão de Obra — Pintura & Reformas
    ["Cor & Traço Pinturas", "Mão de Obra", "Pintura & Reformas", SERVICE_PHOTOS.mao1, "Pintura interna e externa, textura, grafiato, massa corrida e impermeabilização de paredes.", "(11) 95678-9015", "5511956789015", "coretraco.pinturas"],
    ["Obra Limpa Pequenas Reformas", "Mão de Obra", "Pintura & Reformas", SERVICE_PHOTOS.mao2, "Assentamento de pisos e revestimentos, rejunte, drywall e manutenção predial completa.", "(11) 95678-9016", "5511956789016", "obralimpa.reformas"],
    ["Acabamento Fino Revestimentos", "Mão de Obra", "Pintura & Reformas", SERVICE_PHOTOS.mao3, "Aplicação de papel de parede, gesso decorativo, rodapés e renovação rápida de ambientes.", "(11) 95678-9017", "5511956789017", "acabamentofino.sede"],

    // Comércio — Hortifrúti & Orgânicos
    ["Verde Vida Hortifrúti", "Comércio", "Hortifrúti & Orgânicos", SERVICE_PHOTOS.com1, "Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.", "(11) 97766-5544", "5511977665544", "verdevida.organicos"],
    ["Sacolão da Praça", "Comércio", "Hortifrúti & Orgânicos", SERVICE_PHOTOS.com3, "Frutas, verduras e legumes selecionados todos os dias com preço justo e entrega no bairro.", "(11) 97766-5545", "5511977665545", "sacolaodapraca.sede"],
    ["Raiz & Campo Orgânicos", "Comércio", "Hortifrúti & Orgânicos", SERVICE_PHOTOS.com2, "Hortaliças hidropônicas, ovos caipiras, mel natural e temperos frescos colhidos na semana.", "(11) 97766-5546", "5511977665546", "raizcampoorganicos"],
    // Comércio — Informática & Celulares
    ["TechLocal Informática & Celulares", "Comércio", "Informática & Celulares", SERVICE_PHOTOS.com2, "Acessórios para celular, periféricos, notebooks e assistência técnica especializada com peças originais e garantia.", "(11) 99123-4501", "5511991234501", "techlocal.sede"],
    ["CellPoint Capas & Troca de Tela", "Comércio", "Informática & Celulares", SERVICE_PHOTOS.com1, "Películas 3D, carregadores homologados, troca rápida de bateria e reparo de smartphones.", "(11) 99123-4502", "5511991234502", "cellpoint.sede"],
    ["ByteSede Computadores", "Comércio", "Informática & Celulares", SERVICE_PHOTOS.com3, "Formatação, upgrade com SSD, venda de roteadores, cabos e suporte técnico para home office.", "(11) 99123-4503", "5511991234503", "bytesede.info"],
    // Comércio — Mercearia & Empório
    ["Empório da Serra Mercearia", "Comércio", "Mercearia & Empório", SERVICE_PHOTOS.com3, "Queijos artesanais, cafés especiais, temperos naturais, bebidas e produtos coloniais selecionados diariamente.", "(11) 98234-5602", "5511982345602", "emporiodaserra.loja"],
    ["Mercadinho Bom Vizinho", "Comércio", "Mercearia & Empório", SERVICE_PHOTOS.com1, "Itens essenciais do dia a dia, bebidas geladas, frios fatiados na hora e atendimento próximo.", "(11) 98234-5603", "5511982345603", "mercadinhobomvizinho"],
    ["Armazém Grão & Sabor", "Comércio", "Mercearia & Empório", SERVICE_PHOTOS.com2, "Produtos a granel, castanhas, farinhas especiais, chás naturais e grãos selecionados.", "(11) 98234-5604", "5511982345604", "armazemgraoesabor"],
    // Comércio — Papelaria & Utilidades
    ["Papelaria Central & Cópias", "Comércio", "Papelaria & Utilidades", SERVICE_PHOTOS.com2, "Material escolar, impressões, encadernação, plastificação, carimbos e artigos de escritório.", "(11) 98345-6705", "5511983456705", "papelariacentral.sede"],
    ["Casa Útil Bazar & Presentes", "Comércio", "Papelaria & Utilidades", SERVICE_PHOTOS.com3, "Utilidades domésticas, potes organizadores, ferramentas simples e opções criativas para presentear.", "(11) 98345-6706", "5511983456706", "casautil.bazar"],
    ["Criativa Papel & Festas", "Comércio", "Papelaria & Utilidades", SERVICE_PHOTOS.com1, "Papéis especiais, artigos para festas de aniversário, embalagens para lojistas e lembrancinhas.", "(11) 98345-6707", "5511983456707", "criativapapelfestas"],

    // Gastronomia — Cafeteria & Padaria
    ["Café & Prosa Artesanal", "Gastronomia", "Cafeteria & Padaria", SERVICE_PHOTOS.gas1, "Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.", "(11) 98765-4321", "5511987654321", "cafeprosa.artesanal"],
    ["Padaria Pão Quente da Vila", "Gastronomia", "Cafeteria & Padaria", SERVICE_PHOTOS.gas3, "Pão francês quentinho toda hora, broas de milho, roscas doces e café da manhã completo.", "(11) 98765-4322", "5511987654322", "paoquentedavila"],
    ["Grão & Leite Cafeteria", "Gastronomia", "Cafeteria & Padaria", SERVICE_PHOTOS.gas2, "Cappuccinos cremosos, espresso moído na hora, pão de queijo mineiro e bolos caseiros.", "(11) 98765-4323", "5511987654323", "graoeleite.cafe"],
    // Gastronomia — Pizzaria & Massas
    ["Forno Nobre Pizzaria & Massas", "Gastronomia", "Pizzaria & Massas", SERVICE_PHOTOS.gas2, "Pizzas artesanais assadas em forno a lenha com massa de longa fermentação, massas frescas e delivery próprio.", "(11) 97345-6703", "5511973456703", "fornonobre.pizzas"],
    ["Nonna Bella Massas Frescas", "Gastronomia", "Pizzaria & Massas", SERVICE_PHOTOS.gas1, "Lasanhas, nhoques e raviólis artesanais prontos para assar ou quentinhos para entrega na comunidade.", "(11) 97345-6704", "5511973456704", "nonnabella.massas"],
    ["Bairro Burguer & Pizza", "Gastronomia", "Pizzaria & Massas", SERVICE_PHOTOS.gas3, "Pizzas tradicionais e doces, esfihas abertas e combos familiares com entrega rápida na região.", "(11) 97345-6705", "5511973456705", "bairroburguerpizza"],
    // Gastronomia — Doceria & Confeitaria
    ["Doce Encanto Confeitaria", "Gastronomia", "Doceria & Confeitaria", SERVICE_PHOTOS.gas3, "Bolos artesanais para festas, doces finos, tortas geladas e kits personalizados para eventos e encomendas.", "(11) 96456-7804", "5511964567804", "doceencanto.confeitaria"],
    ["Brigaderia Sabor de Casa", "Gastronomia", "Doceria & Confeitaria", SERVICE_PHOTOS.gas1, "Brigadeiros gourmet, bolos de pote, brownies recheados e caixinhas personalizadas para presentes.", "(11) 96456-7805", "5511964567805", "brigaderiasabordecasa"],
    ["Tortas & Sonhos Atelier", "Gastronomia", "Doceria & Confeitaria", SERVICE_PHOTOS.gas2, "Cheesecakes, banoffee, pavês artesanais e sobremesas sob encomenda para fins de semana.", "(11) 96456-7806", "5511964567806", "tortasesonhos.sede"],
    // Gastronomia — Marmitas & Caseiros
    ["Tempero da Vó Marmitaria", "Gastronomia", "Marmitas & Caseiros", SERVICE_PHOTOS.gas1, "Comida caseira feita no dia, marmitex com opções variadas e entrega rápida no horário do almoço.", "(11) 96567-8907", "5511965678907", "temperodavo.marmitas"],
    ["Sabor Leve Marmitas Fit", "Gastronomia", "Marmitas & Caseiros", SERVICE_PHOTOS.gas2, "Refeições congeladas balanceadas, combos semanais low carb e opções vegetarianas.", "(11) 96567-8908", "5511965678908", "saborleve.fit"],
    ["Fogão Mineiro Delivery", "Gastronomia", "Marmitas & Caseiros", SERVICE_PHOTOS.gas3, "Feijoada aos sábados, arroz carreteiro, carnes assadas e porções generosas para toda a família.", "(11) 96567-8909", "5511965678909", "fogaomineiro.sede"],

    // Beleza (Masculina/Feminina) — Salão Unissex
    ["Espaço Raiz Beleza & Barbearia", "Beleza (Masculina/Feminina)", "Salão Unissex", SERVICE_PHOTOS.bel1, "Cortes masculinos e femininos, barba, coloração, escova e estética facial com horário agendado.", "(11) 99887-7665", "5511998877665", "espacoraiz.beleza"],
    ["Salão Essencial Cabelos", "Beleza (Masculina/Feminina)", "Salão Unissex", SERVICE_PHOTOS.bel3, "Hidratação profunda, progressiva sem formol, mechas iluminadas e cortes modernos.", "(11) 99887-7666", "5511998877666", "salaoessencial.sede"],
    ["Studio Vibe Capilar", "Beleza (Masculina/Feminina)", "Salão Unissex", SERVICE_PHOTOS.bel2, "Penteados para festas, tratamentos para cachos, reconstrução capilar e atendimento familiar.", "(11) 99887-7667", "5511998877667", "studiovibecapilar"],
    // Beleza (Masculina/Feminina) — Barbearia
    ["Barbearia Dom Pedro", "Beleza (Masculina/Feminina)", "Barbearia", SERVICE_PHOTOS.bel2, "Corte masculino clássico e degradê, barboterapia com toalha quente e cuidados completos para o visual masculino.", "(11) 95567-8905", "5511955678905", "barbeariadompedro"],
    ["Navalha Fina Barber", "Beleza (Masculina/Feminina)", "Barbearia", SERVICE_PHOTOS.bel1, "Degradê na navalha, alinhamento de barba, pigmentação leve e planos mensais de corte.", "(11) 95567-8906", "5511955678906", "navalhafinabarber"],
    ["Clube do Corte Masculino", "Beleza (Masculina/Feminina)", "Barbearia", SERVICE_PHOTOS.bel3, "Ambiente descontraído, corte infantil e adulto, barba modelada e sobrancelha masculina.", "(11) 95567-8907", "5511955678907", "clubedocortesede"],
    // Beleza (Masculina/Feminina) — Unhas & Sobrancelhas
    ["Studio Bela Essência", "Beleza (Masculina/Feminina)", "Unhas & Sobrancelhas", SERVICE_PHOTOS.bel3, "Manicure, pedicure, design de sobrancelhas, alongamento de cílios e maquiagem social em ambiente climatizado.", "(11) 94678-9006", "5511946789006", "studiobelaessencia"],
    ["Esmalteria Mãos de Seda", "Beleza (Masculina/Feminina)", "Unhas & Sobrancelhas", SERVICE_PHOTOS.bel1, "Esmaltação em gel, blindagem, spa dos pés e cutilagem cuidadosa com materiais esterilizados.", "(11) 94678-9007", "5511946789007", "esmalteriamaosdeseda"],
    ["Olhar Perfeito Sobrancelhas", "Beleza (Masculina/Feminina)", "Unhas & Sobrancelhas", SERVICE_PHOTOS.bel2, "Design personalizado com henna, brow lamination, lash lifting e micropigmentação.", "(11) 94678-9008", "5511946789008", "olharperfeito.sede"],
    // Beleza (Masculina/Feminina) — Estética & Cuidados
    ["Clínica Bem-Estar Estética", "Beleza (Masculina/Feminina)", "Estética & Cuidados", SERVICE_PHOTOS.bel1, "Limpeza de pele profunda, drenagem linfática, massagem relaxante e cuidados faciais.", "(11) 94789-0109", "5511947890109", "clinicabemestar.sede"],
    ["Toque Sereno Massoterapia", "Beleza (Masculina/Feminina)", "Estética & Cuidados", SERVICE_PHOTOS.bel3, "Massagem modeladora, ventosaterapia, liberação miofascial e relaxamento antiestresse.", "(11) 94789-0110", "5511947890110", "toquesereno.massa"],
    ["Pele Viva Dermocosméticos", "Beleza (Masculina/Feminina)", "Estética & Cuidados", SERVICE_PHOTOS.bel2, "Peeling suave, hidratação facial revitalizante e protocolos personalizados de autocuidado.", "(11) 94789-0111", "5511947890111", "peleviva.sede"],

    // Vestuário — Moda Local & Ajustes
    ["Ateliê & Moda Local", "Vestuário", "Moda Local & Ajustes", SERVICE_PHOTOS.ves1, "Roupas casuais masculinas e femininas, confecção própria, ajustes sob medida e peças exclusivas.", "(11) 96543-2109", "5511965432109", "ateliemodalocal"],
    ["Costura & Capricho Ateliê", "Vestuário", "Moda Local & Ajustes", SERVICE_PHOTOS.ves3, "Bainhas rápidas, troca de zíperes, ajuste de vestidos de festa e reformas em roupas.", "(11) 96543-2110", "5511965432110", "costuraecapricho.sede"],
    ["Villa Chic Boutique", "Vestuário", "Moda Local & Ajustes", SERVICE_PHOTOS.ves2, "Vestidos, blusas em linho, conjuntos elegantes e atendimento personalizado no bairro.", "(11) 96543-2111", "5511965432111", "villachic.boutique"],
    // Vestuário — Fitness & Esportes
    ["Urbano Fit & Esportes", "Vestuário", "Fitness & Esportes", SERVICE_PHOTOS.ves2, "Moda fitness, camisetas dry-fit, conjuntos esportivos masculinos e femininos e acessórios para treino e corrida.", "(11) 93789-0107", "5511937890107", "urbanofit.sede"],
    ["Movimento Ativo Wear", "Vestuário", "Fitness & Esportes", SERVICE_PHOTOS.ves1, "Leggings de alta compressão, tops sustentáveis, shorts de corrida e garrafas térmicas.", "(11) 93789-0108", "5511937890108", "movimentoativo.wear"],
    ["Arena Sports Vestuário", "Vestuário", "Fitness & Esportes", SERVICE_PHOTOS.ves3, "Agasalhos, meiões, camisetas térmicas, bermudas esportivas e artigos para futebol e academia.", "(11) 93789-0109", "5511937890109", "arenasports.sede"],
    // Vestuário — Jeans & Casual
    ["Villa Jeans & Casual", "Vestuário", "Jeans & Casual", SERVICE_PHOTOS.ves3, "Calças jeans premium, jaquetas, camisas sociais e looks casuais completos com variedade de numerações.", "(11) 92890-1208", "5511928901208", "villajeans.oficial"],
    ["Denim & Rua Confecções", "Vestuário", "Jeans & Casual", SERVICE_PHOTOS.ves1, "Jeans stretch masculino e feminino, jaquetas sarja e camisetas básicas de algodão.", "(11) 92890-1209", "5511928901209", "denimerua.sede"],
    ["Ponto Casual Moda Dia", "Vestuário", "Jeans & Casual", SERVICE_PHOTOS.ves2, "Polos, bermudas chino, camisas estampadas e peças confortáveis para trabalho e lazer.", "(11) 92890-1210", "5511928901210", "pontocasual.sede"],
    // Vestuário — Infantil & Acessórios
    ["Mundo Pequeno Moda Infantil", "Vestuário", "Infantil & Acessórios", SERVICE_PHOTOS.ves1, "Roupas confortáveis do recém-nascido aos 12 anos, conjuntos escolares e enxoval completo.", "(11) 92901-2311", "5511929012311", "mundopequeno.infantil"],
    ["Passos & Bolsas Acessórios", "Vestuário", "Infantil & Acessórios", SERVICE_PHOTOS.ves2, "Bolsas transversais, mochilas, cintos de couro, carteiras e óculos de sol.", "(11) 92901-2312", "5511929012312", "passosebolsas.sede"],
    ["Brilho & Laço Acessórios", "Vestuário", "Infantil & Acessórios", SERVICE_PHOTOS.ves3, "Semijoias hipoalergênicas, presilhas, lenços, bonés e kits de acessórios para todas as idades.", "(11) 92901-2313", "5511929012313", "brilhoelaco.sede"]
];

const SEED_COMPANIES = RAW_SEED_COMPANIES.map(([name, category, subsegment, logoUrl, description, phone, whatsapp, instagram], index) => ({
    id: `demo-${index + 1}`,
    name,
    category,
    subsegment,
    logoUrl,
    description,
    phone,
    whatsapp,
    instagram,
    approved: true,
    paymentStatus: "EXEMPT"
}));

function loadDemoCompanies() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMPANIES));
        return [...SEED_COMPANIES];
    }
    try {
        return JSON.parse(raw);
    } catch {
        return [...SEED_COMPANIES];
    }
}

async function parseError(response, fallbackMsg) {
    try {
        const body = await response.json();
        if (body?.fields) {
            const first = Object.values(body.fields)[0];
            if (first) return String(first);
        }
        if (body?.error) return String(body.error);
    } catch {
        // ignore parse failure
    }
    return fallbackMsg;
}

const AuthApi = {
    getToken() {
        return localStorage.getItem(USER_TOKEN_KEY) || "";
    },

    getUser() {
        try {
            const raw = localStorage.getItem(USER_INFO_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    saveSession(authResp) {
        localStorage.setItem(USER_TOKEN_KEY, authResp.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(authResp.user));
    },

    clearSession() {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    },

    authHeaders(extra = {}) {
        const token = this.getToken();
        return token
            ? { ...extra, Authorization: `Bearer ${token}` }
            : { ...extra };
    },

    async getProviders() {
        const response = await fetch(`${AUTH_BASE_URL}/providers`);
        if (!response.ok) throw new Error("Não foi possível carregar configurações de autenticação.");
        return await response.json();
    },

    async register(payload) {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao criar conta."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async login(payload) {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao fazer login."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async loginWithGoogle(idToken) {
        const response = await fetch(`${AUTH_BASE_URL}/oauth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken })
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha na autenticação com Google."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async loginWithMicrosoft(accessToken) {
        const response = await fetch(`${AUTH_BASE_URL}/oauth/microsoft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: accessToken })
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha na autenticação com Microsoft."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async verifySession() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const response = await fetch(`${AUTH_BASE_URL}/me`, {
                headers: this.authHeaders()
            });
            if (!response.ok) {
                this.clearSession();
                return null;
            }
            const user = await response.json();
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
            return user;
        } catch {
            return this.getUser();
        }
    },

    async updateAvatar(avatarUrl) {
        const response = await fetch(`${AUTH_BASE_URL}/me/avatar`, {
            method: "PUT",
            headers: this.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ avatarUrl: avatarUrl || null })
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao atualizar foto de perfil."));
        const user = await response.json();
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
        return user;
    }
};

const CompanyApi = {
    isDemoMode: false,

    async list(query = "", category = "", subsegment = "") {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category.trim()) params.set("category", category.trim());
        if (subsegment.trim()) params.set("subsegment", subsegment.trim());

        const url = params.toString() ? `${API_BASE_URL}?${params}` : API_BASE_URL;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao buscar empresas");
            this.isDemoMode = false;
            return await response.json();
        } catch {
            this.isDemoMode = true;
            const q = query.trim().toLowerCase();
            const cat = category.trim().toLowerCase();
            const sub = subsegment.trim().toLowerCase();
            return loadDemoCompanies()
                .filter((c) => {
                    const matchCat = !cat || (c.category || "").toLowerCase() === cat;
                    const matchSub = !sub || (c.subsegment || "").toLowerCase() === sub;
                    const matchQ = !q
                        || (c.name || "").toLowerCase().includes(q)
                        || (c.description || "").toLowerCase().includes(q)
                        || (c.category || "").toLowerCase().includes(q)
                        || (c.subsegment || "").toLowerCase().includes(q);
                    return matchCat && matchSub && matchQ;
                })
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        }
    },

    async listCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error("Erro ao buscar categorias");
            return await response.json();
        } catch {
            return [...OFFICIAL_SERVICE_CATEGORIES];
        }
    },

    async listSubsegments() {
        try {
            const response = await fetch(`${API_BASE_URL}/subsegments`);
            if (!response.ok) throw new Error("Erro ao buscar subsegmentos");
            return await response.json();
        } catch {
            return { ...OFFICIAL_SERVICE_SUBSEGMENTS };
        }
    },

    async listMine() {
        const response = await fetch(`${API_BASE_URL}/mine`, {
            headers: AuthApi.authHeaders()
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao carregar suas lojas."));
        return await response.json();
    },

    async create(payload) {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: AuthApi.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao cadastrar loja."));
        return await response.json();
    },

    async update(id, payload) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: AuthApi.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao enviar edição da loja."));
        return await response.json();
    },

    async submitPixProof(id, payload) {
        const response = await fetch(`${API_BASE_URL}/${id}/pix-proof`, {
            method: "POST",
            headers: AuthApi.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao enviar comprovante Pix."));
        return await response.json();
    }
};
