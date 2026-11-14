package com.empreendesede.config;

import com.empreendesede.model.Company;
import com.empreendesede.model.UserAccount;
import com.empreendesede.repository.CompanyRepository;
import com.empreendesede.repository.UserRepository;
import com.empreendesede.service.PasswordHasher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.OffsetDateTime;
import java.util.List;

@Configuration
@Profile("dev")
public class DataSeeder {

    private static final String MAO_1 = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80";
    private static final String MAO_2 = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80";
    private static final String MAO_3 = "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80";
    private static final String COM_1 = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
    private static final String COM_2 = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";
    private static final String COM_3 = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80";
    private static final String GAS_1 = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80";
    private static final String GAS_2 = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80";
    private static final String GAS_3 = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80";
    private static final String BEL_1 = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80";
    private static final String BEL_2 = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80";
    private static final String BEL_3 = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80";
    private static final String VES_1 = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";
    private static final String VES_2 = "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80";
    private static final String VES_3 = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80";

    @Bean
    CommandLineRunner seedCompanies(
            CompanyRepository repository,
            UserRepository userRepository,
            PasswordHasher passwordHasher,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> {
            String normalizedAdminEmail = adminEmail.trim().toLowerCase();
            UserAccount admin = userRepository.findByEmailIgnoreCase(normalizedAdminEmail)
                    .orElseGet(() -> {
                        UserAccount created = new UserAccount();
                        created.setName("Administrador Único");
                        created.setEmail(normalizedAdminEmail);
                        created.setAuthProvider("LOCAL");
                        created.setRole("ADMIN");
                        return created;
                    });
            admin.setRole("ADMIN");
            admin.setPasswordHash(passwordHasher.hash(adminPassword));
            admin = userRepository.save(admin);

            String testUserEmail = "usuario@empreendesede.com.br";
            UserAccount testUser = userRepository.findByEmailIgnoreCase(testUserEmail)
                    .orElseGet(() -> {
                        UserAccount created = new UserAccount();
                        created.setName("Usuário Teste");
                        created.setEmail(testUserEmail);
                        created.setAuthProvider("LOCAL");
                        created.setRole("USER");
                        return created;
                    });
            testUser.setRole("USER");
            testUser.setPasswordHash(passwordHasher.hash("Usuario@123"));
            testUser = userRepository.save(testUser);

            if (repository.count() > 0) {
                return;
            }

            Company userOwnedSample = createSeedCompany(
                    testUser, "Sede Manutenção & Reparos", "Mão de Obra", "Reparos & Hidráulica", MAO_1,
                    "Serviços elétricos, hidráulicos, montagem de móveis e pequenos reparos residenciais e comerciais com garantia.",
                    "(11) 91234-5678", "5511912345678", "sedemanutencao.oficial"
            );
            userOwnedSample.setPaymentStatus("PAID");
            userOwnedSample.setSubscriptionExpiresAt(OffsetDateTime.now().plusDays(30));

            repository.saveAll(List.of(
                    // Mão de Obra — Reparos & Hidráulica
                    userOwnedSample,
                    createSeedCompany(admin, "HidroFix Caça-Vazamentos", "Mão de Obra", "Reparos & Hidráulica", MAO_2,
                            "Desentupimento, troca de registros, caixas d'água, torneiras e reparos hidráulicos emergenciais na comunidade.",
                            "(11) 91234-5601", "5511912345601", "hidrofix.sede"),
                    createSeedCompany(admin, "Marido de Aluguel Express", "Mão de Obra", "Reparos & Hidráulica", MAO_3,
                            "Fixação de prateleiras, suporte de TV, troca de fechaduras, chuveiros e manutenção geral do lar.",
                            "(11) 91234-5602", "5511912345602", "maridoexpress.local"),
                    // Mão de Obra — Elétrica & Instalações
                    createSeedCompany(admin, "EletroForte Instalações", "Mão de Obra", "Elétrica & Instalações", MAO_2,
                            "Instalação de ar-condicionado, quadros elétricos, tomadas e iluminação LED com atendimento rápido em toda a cidade.",
                            "(11) 93456-7810", "5511934567810", "eletroforte.sede"),
                    createSeedCompany(admin, "Luz & Ponto Elétrica", "Mão de Obra", "Elétrica & Instalações", MAO_1,
                            "Projetos de iluminação residencial, ventiladores de teto, automação simples e revisão segura de fiação.",
                            "(11) 93456-7811", "5511934567811", "luzeponto.eletrica"),
                    createSeedCompany(admin, "ClimaCerto Refrigeração", "Mão de Obra", "Elétrica & Instalações", MAO_3,
                            "Instalação, higienização e recarga de gás para ar-condicionado split e balcões refrigerados.",
                            "(11) 93456-7812", "5511934567812", "climacerto.sede"),
                    // Mão de Obra — Marcenaria & Móveis
                    createSeedCompany(admin, "Marcenaria Tradição & Sob Medida", "Mão de Obra", "Marcenaria & Móveis", MAO_3,
                            "Móveis planejados, restauração em madeira maciça, portas e painéis ripados feitos sob medida para sua casa ou loja.",
                            "(11) 94567-8912", "5511945678912", "marcenariatradicao"),
                    createSeedCompany(admin, "Arte em Madeira Planejados", "Mão de Obra", "Marcenaria & Móveis", MAO_1,
                            "Cozinhas planejadas, guarda-roupas, nichos e balcões comerciais com acabamento em MDF.",
                            "(11) 94567-8913", "5511945678913", "arteemmadeira.sede"),
                    createSeedCompany(admin, "Oficina do Marceneiro", "Mão de Obra", "Marcenaria & Móveis", MAO_2,
                            "Conserto de cadeiras, troca de dobradiças, ajuste de gavetas e fabricação de mesas artesanais.",
                            "(11) 94567-8914", "5511945678914", "oficinadomarceneiro"),
                    // Mão de Obra — Pintura & Reformas
                    createSeedCompany(admin, "Cor & Traço Pinturas", "Mão de Obra", "Pintura & Reformas", MAO_1,
                            "Pintura interna e externa, textura, grafiato, massa corrida e impermeabilização de paredes.",
                            "(11) 95678-9015", "5511956789015", "coretraco.pinturas"),
                    createSeedCompany(admin, "Obra Limpa Pequenas Reformas", "Mão de Obra", "Pintura & Reformas", MAO_2,
                            "Assentamento de pisos e revestimentos, rejunte, drywall e manutenção predial completa.",
                            "(11) 95678-9016", "5511956789016", "obralimpa.reformas"),
                    createSeedCompany(admin, "Acabamento Fino Revestimentos", "Mão de Obra", "Pintura & Reformas", MAO_3,
                            "Aplicação de papel de parede, gesso decorativo, rodapés e renovação rápida de ambientes.",
                            "(11) 95678-9017", "5511956789017", "acabamentofino.sede"),

                    // Comércio — Hortifrúti & Orgânicos
                    createSeedCompany(admin, "Verde Vida Hortifrúti", "Comércio", "Hortifrúti & Orgânicos", COM_1,
                            "Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.",
                            "(11) 97766-5544", "5511977665544", "verdevida.organicos"),
                    createSeedCompany(admin, "Sacolão da Praça", "Comércio", "Hortifrúti & Orgânicos", COM_3,
                            "Frutas, verduras e legumes selecionados todos os dias com preço justo e entrega no bairro.",
                            "(11) 97766-5545", "5511977665545", "sacolaodapraca.sede"),
                    createSeedCompany(admin, "Raiz & Campo Orgânicos", "Comércio", "Hortifrúti & Orgânicos", COM_2,
                            "Hortaliças hidropônicas, ovos caipiras, mel natural e temperos frescos colhidos na semana.",
                            "(11) 97766-5546", "5511977665546", "raizcampoorganicos"),
                    // Comércio — Informática & Celulares
                    createSeedCompany(admin, "TechLocal Informática & Celulares", "Comércio", "Informática & Celulares", COM_2,
                            "Acessórios para celular, periféricos, notebooks e assistência técnica especializada com peças originais e garantia.",
                            "(11) 99123-4501", "5511991234501", "techlocal.sede"),
                    createSeedCompany(admin, "CellPoint Capas & Troca de Tela", "Comércio", "Informática & Celulares", COM_1,
                            "Películas 3D, carregadores homologados, troca rápida de bateria e reparo de smartphones.",
                            "(11) 99123-4502", "5511991234502", "cellpoint.sede"),
                    createSeedCompany(admin, "ByteSede Computadores", "Comércio", "Informática & Celulares", COM_3,
                            "Formatação, upgrade com SSD, venda de roteadores, cabos e suporte técnico para home office.",
                            "(11) 99123-4503", "5511991234503", "bytesede.info"),
                    // Comércio — Mercearia & Empório
                    createSeedCompany(admin, "Empório da Serra Mercearia", "Comércio", "Mercearia & Empório", COM_3,
                            "Queijos artesanais, cafés especiais, temperos naturais, bebidas e produtos coloniais selecionados diariamente.",
                            "(11) 98234-5602", "5511982345602", "emporiodaserra.loja"),
                    createSeedCompany(admin, "Mercadinho Bom Vizinho", "Comércio", "Mercearia & Empório", COM_1,
                            "Itens essenciais do dia a dia, bebidas geladas, frios fatiados na hora e atendimento próximo.",
                            "(11) 98234-5603", "5511982345603", "mercadinhobomvizinho"),
                    createSeedCompany(admin, "Armazém Grão & Sabor", "Comércio", "Mercearia & Empório", COM_2,
                            "Produtos a granel, castanhas, farinhas especiais, chás naturais e grãos selecionados.",
                            "(11) 98234-5604", "5511982345604", "armazemgraoesabor"),
                    // Comércio — Papelaria & Utilidades
                    createSeedCompany(admin, "Papelaria Central & Cópias", "Comércio", "Papelaria & Utilidades", COM_2,
                            "Material escolar, impressões, encadernação, plastificação, carimbos e artigos de escritório.",
                            "(11) 98345-6705", "5511983456705", "papelariacentral.sede"),
                    createSeedCompany(admin, "Casa Útil Bazar & Presentes", "Comércio", "Papelaria & Utilidades", COM_3,
                            "Utilidades domésticas, potes organizadores, ferramentas simples e opções criativas para presentear.",
                            "(11) 98345-6706", "5511983456706", "casautil.bazar"),
                    createSeedCompany(admin, "Criativa Papel & Festas", "Comércio", "Papelaria & Utilidades", COM_1,
                            "Papéis especiais, artigos para festas de aniversário, embalagens para lojistas e lembrancinhas.",
                            "(11) 98345-6707", "5511983456707", "criativapapelfestas"),

                    // Gastronomia — Cafeteria & Padaria
                    createSeedCompany(admin, "Café & Prosa Artesanal", "Gastronomia", "Cafeteria & Padaria", GAS_1,
                            "Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.",
                            "(11) 98765-4321", "5511987654321", "cafeprosa.artesanal"),
                    createSeedCompany(admin, "Padaria Pão Quente da Vila", "Gastronomia", "Cafeteria & Padaria", GAS_3,
                            "Pão francês quentinho toda hora, broas de milho, roscas doces e café da manhã completo.",
                            "(11) 98765-4322", "5511987654322", "paoquentedavila"),
                    createSeedCompany(admin, "Grão & Leite Cafeteria", "Gastronomia", "Cafeteria & Padaria", GAS_2,
                            "Cappuccinos cremosos, espresso moído na hora, pão de queijo mineiro e bolos caseiros.",
                            "(11) 98765-4323", "5511987654323", "graoeleite.cafe"),
                    // Gastronomia — Pizzaria & Massas
                    createSeedCompany(admin, "Forno Nobre Pizzaria & Massas", "Gastronomia", "Pizzaria & Massas", GAS_2,
                            "Pizzas artesanais assadas em forno a lenha com massa de longa fermentação, massas frescas e delivery próprio.",
                            "(11) 97345-6703", "5511973456703", "fornonobre.pizzas"),
                    createSeedCompany(admin, "Nonna Bella Massas Frescas", "Gastronomia", "Pizzaria & Massas", GAS_1,
                            "Lasanhas, nhoques e raviólis artesanais prontos para assar ou quentinhos para entrega na comunidade.",
                            "(11) 97345-6704", "5511973456704", "nonnabella.massas"),
                    createSeedCompany(admin, "Bairro Burguer & Pizza", "Gastronomia", "Pizzaria & Massas", GAS_3,
                            "Pizzas tradicionais e doces, esfihas abertas e combos familiares com entrega rápida na região.",
                            "(11) 97345-6705", "5511973456705", "bairroburguerpizza"),
                    // Gastronomia — Doceria & Confeitaria
                    createSeedCompany(admin, "Doce Encanto Confeitaria", "Gastronomia", "Doceria & Confeitaria", GAS_3,
                            "Bolos artesanais para festas, doces finos, tortas geladas e kits personalizados para eventos e encomendas.",
                            "(11) 96456-7804", "5511964567804", "doceencanto.confeitaria"),
                    createSeedCompany(admin, "Brigaderia Sabor de Casa", "Gastronomia", "Doceria & Confeitaria", GAS_1,
                            "Brigadeiros gourmet, bolos de pote, brownies recheados e caixinhas personalizadas para presentes.",
                            "(11) 96456-7805", "5511964567805", "brigaderiasabordecasa"),
                    createSeedCompany(admin, "Tortas & Sonhos Atelier", "Gastronomia", "Doceria & Confeitaria", GAS_2,
                            "Cheesecakes, banoffee, pavês artesanais e sobremesas sob encomenda para fins de semana.",
                            "(11) 96456-7806", "5511964567806", "tortasesonhos.sede"),
                    // Gastronomia — Marmitas & Caseiros
                    createSeedCompany(admin, "Tempero da Vó Marmitaria", "Gastronomia", "Marmitas & Caseiros", GAS_1,
                            "Comida caseira feita no dia, marmitex com opções variadas e entrega rápida no horário do almoço.",
                            "(11) 96567-8907", "5511965678907", "temperodavo.marmitas"),
                    createSeedCompany(admin, "Sabor Leve Marmitas Fit", "Gastronomia", "Marmitas & Caseiros", GAS_2,
                            "Refeições congeladas balanceadas, combos semanais low carb e opções vegetarianas.",
                            "(11) 96567-8908", "5511965678908", "saborleve.fit"),
                    createSeedCompany(admin, "Fogão Mineiro Delivery", "Gastronomia", "Marmitas & Caseiros", GAS_3,
                            "Feijoada aos sábados, arroz carreteiro, carnes assadas e porções generosas para toda a família.",
                            "(11) 96567-8909", "5511965678909", "fogaomineiro.sede"),

                    // Beleza (Masculina/Feminina) — Salão Unissex
                    createSeedCompany(admin, "Espaço Raiz Beleza & Barbearia", "Beleza (Masculina/Feminina)", "Salão Unissex", BEL_1,
                            "Cortes masculinos e femininos, barba, coloração, escova e estética facial com horário agendado.",
                            "(11) 99887-7665", "5511998877665", "espacoraiz.beleza"),
                    createSeedCompany(admin, "Salão Essencial Cabelos", "Beleza (Masculina/Feminina)", "Salão Unissex", BEL_3,
                            "Hidratação profunda, progressiva sem formol, mechas iluminadas e cortes modernos.",
                            "(11) 99887-7666", "5511998877666", "salaoessencial.sede"),
                    createSeedCompany(admin, "Studio Vibe Capilar", "Beleza (Masculina/Feminina)", "Salão Unissex", BEL_2,
                            "Penteados para festas, tratamentos para cachos, reconstrução capilar e atendimento familiar.",
                            "(11) 99887-7667", "5511998877667", "studiovibecapilar"),
                    // Beleza (Masculina/Feminina) — Barbearia
                    createSeedCompany(admin, "Barbearia Dom Pedro", "Beleza (Masculina/Feminina)", "Barbearia", BEL_2,
                            "Corte masculino clássico e degradê, barboterapia com toalha quente e cuidados completos para o visual masculino.",
                            "(11) 95567-8905", "5511955678905", "barbeariadompedro"),
                    createSeedCompany(admin, "Navalha Fina Barber", "Beleza (Masculina/Feminina)", "Barbearia", BEL_1,
                            "Degradê na navalha, alinhamento de barba, pigmentação leve e planos mensais de corte.",
                            "(11) 95567-8906", "5511955678906", "navalhafinabarber"),
                    createSeedCompany(admin, "Clube do Corte Masculino", "Beleza (Masculina/Feminina)", "Barbearia", BEL_3,
                            "Ambiente descontraído, corte infantil e adulto, barba modelada e sobrancelha masculina.",
                            "(11) 95567-8907", "5511955678907", "clubedocortesede"),
                    // Beleza (Masculina/Feminina) — Unhas & Sobrancelhas
                    createSeedCompany(admin, "Studio Bela Essência", "Beleza (Masculina/Feminina)", "Unhas & Sobrancelhas", BEL_3,
                            "Manicure, pedicure, design de sobrancelhas, alongamento de cílios e maquiagem social em ambiente climatizado.",
                            "(11) 94678-9006", "5511946789006", "studiobelaessencia"),
                    createSeedCompany(admin, "Esmalteria Mãos de Seda", "Beleza (Masculina/Feminina)", "Unhas & Sobrancelhas", BEL_1,
                            "Esmaltação em gel, blindagem, spa dos pés e cutilagem cuidadosa com materiais esterilizados.",
                            "(11) 94678-9007", "5511946789007", "esmalteriamaosdeseda"),
                    createSeedCompany(admin, "Olhar Perfeito Sobrancelhas", "Beleza (Masculina/Feminina)", "Unhas & Sobrancelhas", BEL_2,
                            "Design personalizado com henna, brow lamination, lash lifting e micropigmentação.",
                            "(11) 94678-9008", "5511946789008", "olharperfeito.sede"),
                    // Beleza (Masculina/Feminina) — Estética & Cuidados
                    createSeedCompany(admin, "Clínica Bem-Estar Estética", "Beleza (Masculina/Feminina)", "Estética & Cuidados", BEL_1,
                            "Limpeza de pele profunda, drenagem linfática, massagem relaxante e cuidados faciais.",
                            "(11) 94789-0109", "5511947890109", "clinicabemestar.sede"),
                    createSeedCompany(admin, "Toque Sereno Massoterapia", "Beleza (Masculina/Feminina)", "Estética & Cuidados", BEL_3,
                            "Massagem modeladora, ventosaterapia, liberação miofascial e relaxamento antiestresse.",
                            "(11) 94789-0110", "5511947890110", "toquesereno.massa"),
                    createSeedCompany(admin, "Pele Viva Dermocosméticos", "Beleza (Masculina/Feminina)", "Estética & Cuidados", BEL_2,
                            "Peeling suave, hidratação facial revitalizante e protocolos personalizados de autocuidado.",
                            "(11) 94789-0111", "5511947890111", "peleviva.sede"),

                    // Vestuário — Moda Local & Ajustes
                    createSeedCompany(admin, "Ateliê & Moda Local", "Vestuário", "Moda Local & Ajustes", VES_1,
                            "Roupas casuais masculinas e femininas, confecção própria, ajustes sob medida e peças exclusivas.",
                            "(11) 96543-2109", "5511965432109", "ateliemodalocal"),
                    createSeedCompany(admin, "Costura & Capricho Ateliê", "Vestuário", "Moda Local & Ajustes", VES_3,
                            "Bainhas rápidas, troca de zíperes, ajuste de vestidos de festa e reformas em roupas.",
                            "(11) 96543-2110", "5511965432110", "costuraecapricho.sede"),
                    createSeedCompany(admin, "Villa Chic Boutique", "Vestuário", "Moda Local & Ajustes", VES_2,
                            "Vestidos, blusas em linho, conjuntos elegantes e atendimento personalizado no bairro.",
                            "(11) 96543-2111", "5511965432111", "villachic.boutique"),
                    // Vestuário — Fitness & Esportes
                    createSeedCompany(admin, "Urbano Fit & Esportes", "Vestuário", "Fitness & Esportes", VES_2,
                            "Moda fitness, camisetas dry-fit, conjuntos esportivos masculinos e femininos e acessórios para treino e corrida.",
                            "(11) 93789-0107", "5511937890107", "urbanofit.sede"),
                    createSeedCompany(admin, "Movimento Ativo Wear", "Vestuário", "Fitness & Esportes", VES_1,
                            "Leggings de alta compressão, tops sustentáveis, shorts de corrida e garrafas térmicas.",
                            "(11) 93789-0108", "5511937890108", "movimentoativo.wear"),
                    createSeedCompany(admin, "Arena Sports Vestuário", "Vestuário", "Fitness & Esportes", VES_3,
                            "Agasalhos, meiões, camisetas térmicas, bermudas esportivas e artigos para futebol e academia.",
                            "(11) 93789-0109", "5511937890109", "arenasports.sede"),
                    // Vestuário — Jeans & Casual
                    createSeedCompany(admin, "Villa Jeans & Casual", "Vestuário", "Jeans & Casual", VES_3,
                            "Calças jeans premium, jaquetas, camisas sociais e looks casuais completos com variedade de numerações.",
                            "(11) 92890-1208", "5511928901208", "villajeans.oficial"),
                    createSeedCompany(admin, "Denim & Rua Confecções", "Vestuário", "Jeans & Casual", VES_1,
                            "Jeans stretch masculino e feminino, jaquetas sarja e camisetas básicas de algodão.",
                            "(11) 92890-1209", "5511928901209", "denimerua.sede"),
                    createSeedCompany(admin, "Ponto Casual Moda Dia", "Vestuário", "Jeans & Casual", VES_2,
                            "Polos, bermudas chino, camisas estampadas e peças confortáveis para trabalho e lazer.",
                            "(11) 92890-1210", "5511928901210", "pontocasual.sede"),
                    // Vestuário — Infantil & Acessórios
                    createSeedCompany(admin, "Mundo Pequeno Moda Infantil", "Vestuário", "Infantil & Acessórios", VES_1,
                            "Roupas confortáveis do recém-nascido aos 12 anos, conjuntos escolares e enxoval completo.",
                            "(11) 92901-2311", "5511929012311", "mundopequeno.infantil"),
                    createSeedCompany(admin, "Passos & Bolsas Acessórios", "Vestuário", "Infantil & Acessórios", VES_2,
                            "Bolsas transversais, mochilas, cintos de couro, carteiras e óculos de sol.",
                            "(11) 92901-2312", "5511929012312", "passosebolsas.sede"),
                    createSeedCompany(admin, "Brilho & Laço Acessórios", "Vestuário", "Infantil & Acessórios", VES_3,
                            "Semijoias hipoalergênicas, presilhas, lenços, bonés e kits de acessórios para todas as idades.",
                            "(11) 92901-2313", "5511929012313", "brilhoelaco.sede")
            ));
        };
    }

    private Company createSeedCompany(
            UserAccount owner,
            String name,
            String category,
            String subsegment,
            String logoUrl,
            String description,
            String phone,
            String whatsapp,
            String instagram
    ) {
        Company company = new Company();
        company.setName(name);
        company.setCategory(category);
        company.setSubsegment(subsegment);
        company.setLogoUrl(logoUrl);
        company.setDescription(description);
        company.setPhone(phone);
        company.setWhatsapp(whatsapp);
        company.setInstagram(instagram);
        company.setOwnerId(owner.getId());
        company.setOwnerEmail(owner.getEmail());
        company.setApproved(true);
        company.setPaymentStatus("EXEMPT");
        return company;
    }
}
